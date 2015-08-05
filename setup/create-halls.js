var	config		= require('../config');
var mongoose	= require('mongoose');
var Promise		= require('bluebird');
var Hall	   	= require('../app/models/Hall');

// Connect to database
mongoose.connect(config.database);

module.exports = function() {
	console.log('Creating halls...');

	var hallCreatePromises = [];

	config.halls.forEach(function(hall) {
		// Create Hall with name; store promise
		var prom = Hall.create({ name: hall.name }, function(err) {
			if (err) {
				console.log('Error creating hall (' + hall.name + ')');
				console.log(err);
			}
		});

		// Push promise onto hallCreatePromises
		hallCreatePromises.push(prom);
	});

	// Wait for all hallCreatePromises to complete
	Promise.all(hallCreatePromises).then(function() {
		// Notify and exit
		console.log('Done!');
		process.exit();
	});
};
