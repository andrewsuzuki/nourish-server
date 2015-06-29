var fs = require('fs');

var config = {
	'environment-json': './environment.json',
	'port': process.env.PORT | 8080,
	'database': ''
};

var env = JSON.parse(fs.readFileSync(config['environment-json']));
config.database = env.MONGO_URI;

module.exports = config;
