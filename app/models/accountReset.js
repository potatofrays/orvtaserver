var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var accountResetSchema = new Schema({
	account : {type: String},
	resetType : {type: String},
	resetStatus: {type: String},
	reset_created: { type: Date, default: Date.now},
	station: { type: String },
	reset_updated: {type: Date, default: Date.now}
});

// Date and Time User Created
accountResetSchema.pre('save', function(next){
   now = new Date();
    if (!this.reset_created) {
        this.reset_created = now;
    } else {
      this.reset_updated = now;
    }
    next();
});


 module.exports = mongoose.model('Account_Reset', accountResetSchema);
