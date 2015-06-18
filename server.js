var express 	= require('express'),
	bodyParser 	= require('body-parser'),
	mongoose    = require('mongoose'),
	fs			= require('fs');

var envFile = './environment.json';

var env;

try {
	env = JSON.parse(fs.readFileSync(envFile));
}
catch (err) {
	console.log(err.stack);
	env = {};
}

console.log('env:');
console.log(env);

// db
var mon_options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
                replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } };

mongoose.connect(env.MONGO_URI, mon_options);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {

});

// app

var app	= express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// routes
var router = express.Router();

// test
router.get('/', function(req, res) {
	res.json({ message: 'Nourish API' });
});

// register routes
app.use('/api', router);

// start server
app.listen(port);
console.log('Magic on port ' + port);