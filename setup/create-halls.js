var	config		= require('../config'),
	mongoose	= require('mongoose'),
	Hall		= require('../app/models/Hall');

// Connect to database
mongoose.connect(config.database);

module.exports = function() {
	Object.keys(config.locations).forEach(function(hall_name, i) {
		Hall.create({ name: config.locations[hall_name] }, function(err) {
			if (err) {
				console.log('error creating hall ' + config.locations[hall_name]);
				console.log(err);
			}
		});
	});
};
