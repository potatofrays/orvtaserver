var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountResetSchema = new Schema({
	account : {type: String},
	resetType : {type: String}
});

 module.exports = mongoose.model('Account_Reset', accountResetSchema);

