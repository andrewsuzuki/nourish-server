var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var ItemSchema = new Schema({
        name: String,
	label: {
		nutrition: {
			serving_size: String,
			calories: Number,
			calories_from_fat: Number,
		},
		composition: {
			 total_fat: { amount: String, pdv: Number },
			 sat_fat: { amount: String, pdv: Number },
			 trans_fat: { amount: String }, // no pdv
			 cholesterol: { amount: String, pdv: Number },
			 sodium: { amount: String, pdv: Number },
			 total_carb: { amount: String, pdv: Number },
			 dietary_fiber: { amount: String, pdv: Number },
			 sugars: { amount: String }, // no pdv
			 protein: { amount: String }, // no pdv
		},
		vitamins: {
			 a: Number,
			 b: Number,
			 calc: Number,
			 iron: Number,
		},
		allergens: String
	},
    	// pop:
    	Hall: { type: Schema.Types.ObjectId, ref: 'Hall' }
});

module.exports = mongoose.model('Item', ItemSchema);
