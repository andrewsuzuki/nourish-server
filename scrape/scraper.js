var     rp	= require('request-promise'),
        cheerio	= require('cheerio'),
	Promise	= require('bluebird'),
	mongoose= require('mongoose'),
	config	= require('../config'),
	Hall	= require('../app/models/Hall'),
	Meal	= require('../app/models/Meal'),
	Item	= require('../app/models/Item');

console.log('Scraping...');
console.log('-----------');

// Connect to database
mongoose.connect(config.database);

// A major meh
String.prototype.toTitleCase = function() {
        return this.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
};

// Form meal menu page url
var formUrl = function(locationNum, date, mealType) {
        return 'http://nutritionanalysis.dds.uconn.edu/longmenu.asp?naFlag=1&locationNum='+locationNum+'&dtdate='+date+'&mealName='+mealType;
};

// List of meal types
var mealTypes = [ 'Breakfast', 'Lunch', 'Dinner', 'Brunch' ];

var scrapeMeal = function(hall, date, mealType) {
        murl = formUrl(hall, date, mealType);

	// keep track of label scrape promises
	label_promises = [];

        rp(murl).then(function(html) {
		var meal = [];

		var $ = cheerio.load(html);
		var lastcat;
		var trs = $('body > table > tr').eq(1).children('td').eq(1).children('div').eq(1).children('table').eq(0).children('form').first().children('tr');
		trs.each(function(i, el) {
			if (i === 0 || i === 1) return true; // skip first two table header rows

			var tdi = $(el).children('td').first().find('> table > tr > td > table > tr > td');
			var namediv = tdi.eq(0).children('div').first();

			if (namediv.hasClass('longmenucoldispname')) {
				// menu item
				var name = namediv.children('a').first().text();
				var href = namediv.children('a').first().attr('href');

				label_promises.push(scrapeLabelPromise('http://nutritionanalysis.dds.uconn.edu/' + href, lastcat).then(function(labelcat) {
					// only add item to menu after nutrition label data is scraped
					meal.push({
						'name': name,
						'cat': labelcat[1],
						'label': labelcat[0],
					});
				}));
			} else if (namediv.hasClass('longmenucolmenucat')) {
				// menu category; remember for the following items
				lastcat = namediv.text().replace(/-/g, '').trim().toLowerCase().toTitleCase();
			}
		});

		return meal;
	}).then(function(meal) {
		// wait for all label scrape promises to be fulfilled
		Promise.all(label_promises).then(function() {
			// all done scraping, now save everything
			mealMergeDB(hall, date, mealType, meal);
		});
	});
};

var mealMergeDB = function(hall, date, mealType, meal) {
	console.log('---');
	console.log('Hall: ' + hall);
	console.log('Date: ' + date);
	console.log('Meal type: ' + mealType);

	if (meal.length) {
		Item.collection.insert(meal, function(err, docs) {
			if (err) {
				console.log('item collection insertion error');
				console.log(err);
			} else {
				console.log('success (item collection insertion)');
			}
		});
	} else {
		console.log('Meal not found.');
	}
};

var scrapeLabelPromise = function(url, cat) {
        return rp(url)
		.then(function(html) {
                        var label = {
                                nutrition: { },
                                composition: { },
				vitamins: { },
				allergens: undefined,
                        };

                        var $ = cheerio.load(html);
			var table = $('body > table').first().find('> tr > td > table').first();

			scrapeLabelLeft(table, label);
			scrapeLabelVitamins(table, label);
			scrapeLabelComposition(table, label);
			scrapeLabelAllergens($, label);

			return [label, cat];
                });
};

var scrapeLabelLeft = function(table, label) {
	var left_fonts = table.find('> tr > td').first().find('> font');

	if (left_fonts.eq(2).text()) { // serving size
		label.nutrition.serving_size = left_fonts.eq(2).text();
	}
	if (left_fonts.eq(3).text().indexOf('Calories') > -1) { // calories
		label.nutrition.calories = left_fonts.eq(3).text().substring(9);
	}
	if (left_fonts.eq(4).text().indexOf('Calories from Fat') > -1) { // calories from fat
		label.nutrition.calories_from_fat = left_fonts.eq(4).text().trim().substring(18);
	}
};

var scrapeLabelVitamins = function(table, label) {
	var tds = table.find('> tr').eq(6).find('> td > table > tr').first().children('td');

	var vit_a = tds.eq(0).find('> table > tr > td').children('font');
	var vit_c = tds.eq(1).find('> table > tr > td > li').children('font');
	var calc = tds.eq(2).find('> table > tr > td > li').children('font');
	var iron = tds.eq(3).find('> table > tr > td > li').children('font');

	if (vit_a.first().text() == 'Vit A') { // vitamin a
		label.vitamins.a = parseInt(vit_a.eq(1).text().trim().slice(0, -1));
	}
	if (vit_c.first().text() == 'Vit C') { // vitamin c
		label.vitamins.c = parseInt(vit_c.eq(1).text().trim().slice(0, -1));
	}
	if (calc.first().text() == 'Calc') { // calcium
		label.vitamins.calc = parseInt(calc.eq(1).text().trim().slice(0, -1));
	}
	if (iron.first().text() == 'Iron') { // iron
		label.vitamins.iron = parseInt(iron.eq(1).text().trim().slice(0, -1));
	}
};

var scrapeLabelComposition = function(table, label) {
	var one = table.find('> tr').eq(1).children('td');
	var two = table.find('> tr').eq(2).children('td');
	var three = table.find('> tr').eq(3).children('td');
	var four = table.find('> tr').eq(4).children('td');
	var five = table.find('> tr').eq(5).children('td');

	if (one.eq(0).children('font').first().text().trim() == 'Total Fat') {
		label.composition.total_fat = {
			amount: one.eq(0).children('font').eq(1).text().trim(),
			pdv: parseInt(one.eq(1).children('font').eq(0).text().trim())
		};
	}
	if (one.eq(2).children('font').first().text().trim() == 'Tot. Carb.') {
		label.composition.total_carb = {
			amount: one.eq(2).children('font').eq(1).text().trim(),
			pdv: parseInt(one.eq(3).children('font').eq(0).text().trim())
		};
	}
	if (two.eq(0).children('font').first().text().trim() == 'Sat. Fat') {
		label.composition.sat_fat = {
			amount: two.eq(0).children('font').eq(1).text().trim(),
			pdv: parseInt(two.eq(1).children('font').eq(0).text().trim())
		};
	}
	if (two.eq(2).children('font').first().text().trim() == 'Dietary Fiber') {
		label.composition.dietary_fiber = {
			amount: two.eq(2).children('font').eq(1).text().trim(),
			pdv: parseInt(two.eq(3).children('font').eq(0).text().trim())
		};
	}
	if (three.eq(0).children('font').first().text().trim() == 'Trans Fat') {
		label.composition.trans_fat = {
			amount: three.eq(0).children('font').eq(1).text().trim()
		};
	}
	if (three.eq(2).children('font').first().text().trim() == 'Sugars') {
		label.composition.sugars = {
			amount: three.eq(2).children('font').eq(1).text().trim()
		};
	}
	if (four.eq(0).children('font').first().text().trim() == 'Cholesterol') {
		label.composition.cholesterol = {
			amount: four.eq(0).children('font').eq(1).text().trim(),
			pdv: parseInt(four.eq(1).children('font').eq(0).text().trim())
		};
	}
	if (four.eq(2).children('font').first().text().trim() == 'Protein') {
		label.composition.protein = {
			amount: four.eq(2).children('font').eq(1).text().trim()
		};
	}
	if (five.eq(0).children('font').first().text().trim() == 'Sodium') {
		label.composition.sodium = {
			amount: five.eq(0).children('font').eq(1).text().trim(),
			pdv: parseInt(five.eq(1).children('font').eq(0).text().trim())
		};
	}
};

var scrapeLabelAllergens = function($, label) {
	var allergens = $('body > table').eq(1).find('> tr > td > span').eq(1).text().trim();
	label.allergens = allergens || '';
};

// temporary test
mealTypes.forEach(function(mealType) {
	scrapeMeal(16, '06/30/2015', mealType);
});
