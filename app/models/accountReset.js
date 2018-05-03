var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountResetSchema = new Schema({
	station : {type: String},
	account : {type: String},
	resetType : {type: String},
	reset_created: {type: Date, default: Date.now},
	reset_updated: {type: Date, default: Date.now}
});

// Date and Time User Created
accountResetSchema.pre('save', function(next){
   now = new Date();
    if (!this.reset_created) {
        this.police_createdAt = now;
    } else {
      this.reset_updated = now;
    }
    next();
});


 module.exports = mongoose.model('Account_Reset', accountResetSchema);
