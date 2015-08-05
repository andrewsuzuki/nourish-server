var fs = require('fs');

var config = {
  'environment-json': './environment.json',
  'port': process.env.PORT | 8080,
  'scrape-time': '* * * * *',
  'database': '',
  'halls': [
    { id: 1,  name: 'Whitney' },
    { id: 3,  name: 'Buckley' },
    { id: 5,  name: 'McMahon' },
    { id: 6,  name: 'Putnam' },
    { id: 7,  name: 'North' },
    { id: 15, name: 'Northwest' },
    { id: 16, name: 'South' },
    { id: 42, name: 'Gelfenbien Commons (Towers)' }
  ],
  'mealTypes': [
    'Breakfast', // 0
    'Lunch', // 1
    'Dinner', // 2
    'Brunch' // 3
  ],
  'advanceScrapeDays': 6 // advance days to attempt to scrape after today
};

// Read environment file and add specific entries to config
var env = JSON.parse(fs.readFileSync(config['environment-json']));
config.database = env.MONGO_URI;

module.exports = config;
