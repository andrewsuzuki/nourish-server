var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var MealSchema = new Schema({
        type: { type: Number, default: 0 },
        date: { type: Date, default: Date.now },
    	// pop:
    	hall: { type: Schema.Types.ObjectId, ref: 'Hall' },
    	meals: [{ type: Schema.Types.ObjectId, ref: 'Item' }]
});

module.exports = mongoose.model('Meal', MealSchema);
