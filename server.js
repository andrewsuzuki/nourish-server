// require
// -------

var express     = require('express'),
    bodyParser  = require('body-parser'),
    mongoose    = require('mongoose'),
    config	= require('./config')
    path	= require('path');

// db
// --

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

app.get('*', function(req, res) {
	return res.json({ message: 'Nourish Server'});
});

// server
// ------

app.listen(config.port);
console.log('Magic on port ' + config.port);
