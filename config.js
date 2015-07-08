var fs = require('fs');

var config = {
	'environment-json': './environment.json',
	'port': process.env.PORT | 8080,
	'scrape-time': '* * * * *',
	'database': '',
	'locations': {
		1: 'Whitney',
		3: 'Buckley',
		5: 'McMahon',
		6: 'Putname',
		7: 'North',
		15: 'Northwest',
		16: 'South',
		42: 'Gelfenbien Commons (Towers)',
	},
	'mealTypes': [ 'Breakfast', 'Lunch', 'Dinner', 'Brunch' ],
	'advanceScrapeDays': 6 // advance days to attempt to scrape after today
};

var env = JSON.parse(fs.readFileSync(config['environment-json']));
config.database = env.MONGO_URI;

module.exports = config;
