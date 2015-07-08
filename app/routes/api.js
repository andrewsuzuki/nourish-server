// grab models

var Hall	= require('../models/Hall');
var Meal	= require('../models/Meal');
var Item	= require('../models/Item');

module.exports = function(app, express) {
	var api = express.Router();

	api.route('/').get(function(req, res) {
		res.json({ message: 'Nourish API' });
	});

	api.route('/halls')
		.get(function(req, res) {
			Hall
                .find({})
                .populate({ path: 'meals', select: 'date type' })
                .then(function(err, halls) {
                    if (err) {
                        res.send(err);
                    }

                    res.send(halls);
                })
		});

	api.route('/meals')
		.get(function(req, res) {
			Meal
				.find({})
				.populate({ path: 'items', select: 'name' })
				.then(function(err, meals) {
					if (err) {
						res.send(err);
					}

					res.send(meals);
				});
		});

	api.route('/items')
		.get(function(req, res) {
			Item.find(function(err, items) {
				if (err) {
					res.send(err);
				}

				res.send(items);
			});
		});

	return api;
};
