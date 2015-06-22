var mongoose	= require('mongoose');
var Schema		= mongoose.Schema;

var MealSchema = new Schema({
	name: String
});

module.exports = mongoose.model('Meal', MealSchema);