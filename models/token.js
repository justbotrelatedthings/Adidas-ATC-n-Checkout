var mongoose = require('mongoose'), Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var tokenSchema = new Schema({
	token: String,
	really: {
		sofar: String
	}
});

var Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
