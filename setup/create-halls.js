var	config		= require('../config'),
	mongoose	= require('mongoose'),
	Promise		= require('bluebird'),
	Hall		= require('../app/models/Hall');

// Connect to database
mongoose.connect(config.database);

module.exports = function() {
	console.log('creating halls...');

	var hc_promises = [];

	Object.keys(config.locations).forEach(function(hall_name, i) {
		hc_promises.push(Hall.create({ name: config.locations[hall_name] }, function(err) {
			if (err) {
				console.log('error creating hall ' + config.locations[hall_name]);
				console.log(err);
			}
		}));
	});

	Promise.all(hc_promises).then(function() {
		console.log('done!');
		process.exit();
	});
};
