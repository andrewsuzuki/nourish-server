var express     = require('express');
var app         = express();
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var cronJob     = require('cron').CronJob;
var cpExec      = require('child_process').exec;
var path        = require('path');
var config      = require('./config');

/**
* Database connection
*/

mongoose.connect(config.database);

/**
* Middleware
*/

// Set up body parser to interpret incoming json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configure our app to handle CORS requests
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

/**
* Routes
*/

// Grab out API routes
var apiRoutes = require('./app/routes/api')(app, express);

// Use API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', function(req, res) {
  return res.json({ message: 'Nourish Server'});
});

// Catch-all (send 404)
app.use(function(req, res, next) {
  res.status(404).json({ message: '404 not found' });
});

/**
* Chat
*/

require('./app/chat')(io);

/**
* Server
*/

http.listen(config.port, function() {
  console.log('Magic on port ' + config.port);
});

/**
* Cron scrape job
*/

// Only scrape if our env var allows it
if (process.env.NOSCRAPE !== 'true') {
  // Create cron job
  var scrapeJob = new cronJob({
    // Don't start immediately
    start: false,
    // Scheduled according to config
    cronTime: config['scrape-time'],
    onTick: function() {
      // Create child process running our scraper script
      var child = cpExec('node ' + path.join('.', 'scrape', 'scraper.js'));
      // For now, write incoming data to stdout
      child.stdout.on('data', function(data) {
        process.stdout.write(data); // TODO
      });
      // For now, write incoming errors to stdout
      child.stderr.on('data', function(data) {
        console.log('stderr ' + data); // TODO
      });
      // Report scraper exit code
      child.on('close', function(code) {
        console.log('Scraper exit code: ' + code);
      });
    }
  });

  // Start the cron job immediately
  scrapeJob.start();
}
