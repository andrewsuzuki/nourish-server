var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var HallSchema = new Schema({
        name: String,
    	// pop:
    	meals: [{ type: Schema.Types.ObjectId, ref: 'Meal' }]
});

module.exports = mongoose.model('Hall', HallSchema);
