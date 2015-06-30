var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;

var ItemSchema = new Schema({
        name: String,
    	// pop:
    	Hall: { type: Schema.Types.ObjectId, ref: 'Hall' }
});

module.exports = mongoose.model('Item', ItemSchema);
