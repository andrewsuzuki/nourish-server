// require
// -------

var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    cronJob	= require('cron').CronJob,
    cpExec	= require('child_process').exec,
    path	= require('path'),
    config	= require('./config');

// database
// --------

mongoose.connect(config.database);

// app + middleware
// ----------------

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// configure our app to handle CORS requests
app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
	next();
});

// routes
// ------

var apiRoutes = require('./app/routes/api')(app, express);

app.use('/api', apiRoutes);

app.get('/', function(req, res) {
	return res.json({ message: 'Nourish Server'});
});

// handle 404s
app.use(function(req, res, next) {
	res.status(404).json({ message: '404 not found' });
});

// server
// ------

app.listen(config.port);
console.log('Magic on port ' + config.port);

// cron scrape job
// ---------------

var scrapeJob = new cronJob({
	start: false,
	cronTime: config['scrape-time'],
    	onTick: function() {
		var child = cpExec('node ' + path.join('.', 'scrape', 'scraper.js'));
		child.stdout.on('data', function(data) {
			process.stdout.write(data);
		});
		child.stderr.on('data', function(data) {
			console.log('stderr ' + data);
		});
		child.on('close', function(code) {
			console.log('scrape exit code: ' + code);
		});
	}
});

scrapeJob.start();
