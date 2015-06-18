var express 	= require('express'),
	bodyParser 	= require('body-parser'),
	mongoose    = require('mongoose');

// db
// mongoose.connect('');

var app	= express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 8080;

// routes
var router = express.Router();

// test
router.get('/', function(req, res) {
	res.json({ message: 'Nourish API' });
});

// register routes
app.use('/api', router);

// start server
app.listen( port, ipaddress, function() {
	console.log((new Date()) + ' Server is listening on port ' + port + '...openshift ip/port is: ' + process.env.OPENSHIFT_NODEJS_IP + ':' + process.env.OPENSHIFT_NODEJS_PORT);
});