var	request	= require('request'),
	cheerio = require('cheerio');

console.log('Scraping...');
console.log('-----------');

String.prototype.toTitleCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};

var url = function(locationNum, date, mealType) {
	return 'http://nutritionanalysis.dds.uconn.edu/longmenu.asp?naFlag=1&locationNum='+locationNum+'&dtdate='+date+'&mealName='+mealType;
};

var locations = [
	1, // Whitney
	3, // Buckley
	5, // McMahon
	6, // Putnam
	7, // North
	15, // Northwest
	16, // South
	42, // Gelfenbien Commons (Towers)
];

var mealTypes = [ 'Breakfast', 'Lunch', 'Dinner', 'Brunch' ];

mealTypes.forEach(function(mealType) {
	murl = url(16, '06/30/2015', mealType);

	request(murl, function(err, res, html) {
		if (!err) {
			var meal = [];
			var $ = cheerio.load(html);
			var lastcat;
			var name;
			$('body > table > tr').eq(1).children('td').eq(1).children('div').eq(1).children('table').eq(0).children('form').first().children('tr').each(function(i, el) {
				if (i === 0 || i === 1) return true; // skip first two table header rows
				var tdi = $(el).children('td').first().find('> table > tr > td > table > tr > td');
				var namediv = tdi.eq(0).children('div').first();
				if (namediv.hasClass('longmenucoldispname')) {
					// menu item
					name = namediv.children('a').first().text();
					var href = namediv.children('a').first().attr('href');
					meal.push({
						'name': name,
						'href': href,
						'cat': lastcat,
					});
				} else if (namediv.hasClass('longmenucolmenucat')) {
					// menu category
					name = namediv.text().replace(/-/g, '').trim().toLowerCase().toTitleCase();
					lastcat = name;
				} else {
					return true;
				}
			});

			console.log('\n' + mealType + ' ------------------\n');
			console.log(meal);
		}
	});
});
