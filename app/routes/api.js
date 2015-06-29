// grab models

var Hall	= require('../models/Hall');
var Meal	= require('../models/Meal');
var Item	= require('../models/Item');

module.exports = function(app, express) {
	var api = express.Router();

	api.route('/').get(function(req, res) {
		res.json({ message: 'Nourish API' });
	});

	api.route('/items').get(function(req, res) {
		
	});
};
