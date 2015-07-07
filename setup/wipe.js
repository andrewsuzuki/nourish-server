var	config		= require('../config'),
	mongoose	= require('mongoose'),
	Hall		= require('../app/models/Hall'),
	Meal		= require('../app/models/Meal'),
	Item		= require('../app/models/Item');

// Connect to database
mongoose.connect(config.database);

module.exports = function() {
	console.log('wiping...');

	var dc = 0;

	// for whatever reason, model promises aren't working.
	// the patch:
	var done = function() {
		dc += 1;
		if (dc === 3) {
			console.log('done!');
			process.exit();
		}
	};

	Hall.remove({}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('hall collection remove success');
		}
		done();
	});

	Meal.remove({}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('meal collection remove success');
		}
		done();
	});

	Item.remove({}, function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log('item collection remove success');
		}
		done();
	});
};
