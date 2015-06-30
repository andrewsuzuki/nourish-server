var     request = require('request'),
        cheerio = require('cheerio');

console.log('Scraping...');
console.log('-----------');

String.prototype.toTitleCase = function() {
        return this.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
};

var formUrl = function(locationNum, date, mealType) {
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

var scrapeMeal = function(mealType) {
        murl = formUrl(16, '06/30/2015', mealType);

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
};

var scrapeLabel = function(url) {
        request(url, function(err, res, html) {
                if (!err) {
                        var label = {
                                nutrition: {
                                        serving_size: undefined,
                                        calories: undefined,
                                        calories_from_fat: undefined,
                                },
                                composition: {
					//total_fat: { amount: 0, pdv: 0 },
					//sat_fat: { amount: 0, pdv: 0 },
					//trans_fat: { amount: 0, pdv: 0 },
					//cholesterol: { amount: 0, pdv: 0 },
					//sodium: { amount: 0, pdv: 0 },
					//total_carb: { amount: 0, pdv: 0 },
					//fiber: { amount: 0, pdv: 0 },
					//sugars: { amount: 0, pdv: 0 },
					//protein: { amount: 0, pdv: 0 },
                                },
				vitamins: {
					//a: 0,
					//b: 0,
					//calc: 0,
					//iron: 0,
				},
				allergens: [],
                        };

                        var $ = cheerio.load(html);
			var table = $('body > table').first().find('> tr > td > table').first();

			// left side

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

			// vitamins

			var vitamin_tds = table.find('> tr').eq(6).find('> td > table > tr').first().children('td');

			var vit_a = vitamin_tds.eq(0).find('> table > tr > td').children('font');
			var vit_c = vitamin_tds.eq(1).find('> table > tr > td > li').children('font');
			var calc = vitamin_tds.eq(2).find('> table > tr > td > li').children('font');
			var iron = vitamin_tds.eq(3).find('> table > tr > td > li').children('font');

			if (vit_a.first().text() == 'Vit A') { // vitamin a
				label.vitamins.a = vit_a.eq(1).text().trim().slice(0, -1);
			}
			if (vit_c.first().text() == 'Vit C') { // vitamin c
				label.vitamins.c = vit_c.eq(1).text().trim().slice(0, -1);
			}
			if (calc.first().text() == 'Calc') { // calcium
				label.vitamins.calc = calc.eq(1).text().trim().slice(0, -1);
			}
			if (iron.first().text() == 'Iron') { // iron
				label.vitamins.iron = iron.eq(1).text().trim().slice(0, -1);
			}
			console.log(label);
                }
        });
};

mealTypes.forEach(scrapeMeal);
//scrapeLabel('http://nutritionanalysis.dds.uconn.edu/label.asp?locationNum=16&locationName=South+Campus+Marketplace&dtdate=6%2F30%2F2015&RecNumAndPort=241001%2A2');
