// grab models
var Hall    = require('../models/Hall');
var Meal    = require('../models/Meal');
var Item    = require('../models/Item');
var Promise = require('bluebird');
var moment  = require('moment');

module.exports = function(app, express) {
  var api = express.Router();

  // API simple root endpoint
  api.route('/').get(function(req, res) {
    res.json({ message: 'Nourish API' });
  });

  // Sends all data
  api.route('/init')
    .get(function(req, res) {
      var halls = [];

      // What's today's date?
      var today = moment().startOf('day');

      Hall
        // Find all halls
        .find({})
        .then(function(hallsRaw) {
          // Keep track of meal population promises
          var mealPopulatePromises = [];

          // Loop halls
          hallsRaw.forEach(function(hall) {
            // Only include if hall has meals
            if (hall.meals.length) {
              // Populate hall with meals from today onwards
              mealPopulatePromises.push(Meal.populate(hall, {
                path: 'meals',
                // Only match meals today onwards
                //match: { date: { $gte: today } }
                match: { date: {$gte: new Date(2015, 6, 1) } }
              }).then(function() {
                // Add
                if (hall.meals.length) {
                  halls.push(hall);
                }
              }));
            }
          });

          // Continue when all halls are populated
          return Promise.all(mealPopulatePromises);
        })
        .then(function() {
          // Keep track of item population promises
          var itemPopulatePromises = [];

          // Loop halls
          halls.forEach(function(hall) {
            // Populate each hall's meals with items
            itemPopulatePromises.push(Item.populate(hall.meals, {
              path: 'items'
            }));
          });

          // Continue only when each hall's meals are populated
          return Promise.all(itemPopulatePromises);
        })
        .then(function() {
          // Send response
          res.send(halls);
        });
        // TODO: handle error
    });

  return api;
};
