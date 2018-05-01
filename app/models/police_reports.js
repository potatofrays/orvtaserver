var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//people_involved Schema
var peopleInvolvedSchema = new Schema({
	people_involved_age : {type: Number},
	people_involved_name : {type: String},
	people_involved_gender : {type: String},
	people_involved_citizenship : {type: String},
	people_involved_status: {type: String},
	people_involved_type: {type: String},//walkin
	people_involved_violation:{type:String}
});

//vehicle Schema
var vehicleSchema = new Schema({
	vehicle_platenumber : {type: String},
	vehicle_type : {type: String},
	vehicle_brand: {type: String},
	vehicle_model : {type: String}

});

//police_report Schema
var policeReport = new Schema({
	committed_at: {type: Date},
	reported_at: {type: Date, default: Date.now},
	accident_type: {type: String},
	accident_cause: {type: String},
	police_username:{type: String},
	location_coordinates:{type:[Number, Number]},
	address_thoroughfare:{type: String},
	address_municipality:{type: String},
	address_province:{type: String},
	report_credibility:{type: String},
	people_involved_id: [{ type: Schema.Types.ObjectId, ref: 'People_Involved' }],
	vehicle_id: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }]
    //image_id
    //audio_id
});
// Indexes this schema in geoJSON format (critical for running proximity searches)
policeReport.index({location_coordinates: '2dsphere'});

// Date and Time User Created
policeReport.pre('save', function(next){
   now = new Date();
    if (!this.reported_at) {
        this.reported_at = now;
    } else {
      this.reported_at = now;
    }
    next();
});



var Police_Report = mongoose.model('Police_Report', policeReport);
var People_Involved = mongoose.model('People_Involved', peopleInvolvedSchema);
var Vehicle  = mongoose.model('Vehicle', vehicleSchema);


module.exports = {
	Police_Report: Police_Report,
	People_Involved : People_Involved,
	Vehicle : Vehicle
}
