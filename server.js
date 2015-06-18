var express 	= require('express'),
	bodyParser 	= require('body-parser'),
	mongoose    = require('mongoose');

// db
mongoose.connect('');

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