// Dependencies
var mongoose        = require('mongoose');
//var police_report   = require('../models/report'); // Import Report Model
var police_user     = require('../models/user');
var models          = require('../models/police_reports');

// Opens App Routes
module.exports = function(app) {

   // GET Routes
   // --------------------------------------------------------
   // Retrieve records for all users in the db
   app.get('/police_reports', function(req, res){

       // Uses Mongoose schema to run the search (empty conditions)
       var query = models.Police_Report.find({$and: [{report_credibility: { $ne: 'Fraud'}}, {report_credibility: { $ne: 'Pending'}}]});
       query.exec(function(err, police_reports){
           if(err)
               res.send(err);

           // If no errors are found, it responds with a JSON of all users
           res.json(police_reports);
       });
   });
   //------------------------------------------------------------
   //add people involved
   app.put('/addPeople', function(req,res){
       models.Police_Report.findById(req.body._id, function(err, people){
               var addPep = new models.People_Involved();
               addPep.people_involved_age = req.body.people_involved_age;
               addPep.people_involved_name = req.body.people_involved_name;
               addPep.people_involved_gender = req.body.people_involved_gender;
               addPep.people_involved_citizenship = req.body.people_involved_citizenship;
               addPep.people_involved_violation = req.body.people_involved_violation;
               addPep.people_involved_status = req.body.people_involved_status;
               addPep.people_involved_type = req.body.people_involved_type;
               addPep.save();
               if(err){
                    res.json(500, err);
                }else if(people){
                   console.log(req);
                   people.people_involved_id.push(addPep);
                   people.save();
                   res.json({success:true, message: 'Added People Involved successfully'});
                }
             });
       });
   //------------------------------------------------------------
   //add people involved
   app.put('/addVehicle', function(req,res){
       models.Police_Report.findById(req.body._id, function(err, vehicle){
               var addVehicle = new models.Vehicle();
               addVehicle.vehicle_platenumber = req.body.vehicle_platenumber;
               addVehicle.vehicle_type = req.body.vehicle_type;
               addVehicle.vehicle_brand = req.body.vehicle_brand;
               addVehicle.vehicle_model = req.body.vehicle_model;
               addVehicle.save();
               if(err){
                   res.json(500, err);
                }else if(vehicle){
                   console.log(req);
                   vehicle.vehicle_id.push(addVehicle);
                   vehicle.save();
                   res.json({success:true,  message: 'Added Vehicle successfully'});
                }
             });
       });

   // POST Routes
   // --------------------------------------------------------
   // Provides method for saving new users in the db
   app.post('/police_reports', function(req, res){

       // Creates a new User based on the Mongoose schema and the post bo.dy
       var newReport = new models.Police_Report(req.body);

       // New User is saved in the db.
       newReport.save(function(err, report){
           if(err)
               res.send(err);
           // If no errors are found, it responds with a JSON of the new user
           res.json({success: true, id: report.id, message: 'Report Created Successfully'});
       });
   });


   // Retrieves JSON records for all users who meet a certain set of query conditions
   app.post('/query/', function(req, res){

       // Grab all of the query parameters from the body.
       var lat             = req.body.latitude;
       var long            = req.body.longitude;
       var distance        = req.body.distance;
       var reqVerified     = req.body.reqVerified;

       // Opens a generic Mongoose Query. Depending on the post body we will...
       var query = models.Police_Report.find({});

       // ...include filter by Max Distance (converting miles to meters)
       if(distance){
           // Using MongoDB's geospatial uerying features. (Note how coordinates are set [long, lat]
           query = query.where('location_coordinates').near({ center: {type: 'Point', location_coordinates: [long, lat]},

               // Converting meters to miles. Specifying spherical geometry (for globe)
               maxDistance: distance * 1609.34, spherical: true});

       }
/*
       // ...include filter by Favorite Language
       if(police_username){
           query = query.where('police_username').equals(police_username);
       }
       // ...include filter by Favorite Language
       if(accident_type){
           query = query.where('accident_type').equals(accident_type);
       }
       if(accident_cause){
           query = query.where('accident_cause').equals(accident_cause);
       }
       // ...include filter by Favorite Language
       if(vehicleType){
           query = query.where('vehicleType').equals(vehicleType);
       }
       // ...include filter by Favorite Language
       if(plateNum){
           query = query.where('plateNum').equals(plateNum);
       }
   */
       // ...include filter for HTML5 Verified Locations
       if(reqVerified){
           query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
       }

       // Execute Query and Return the Query Results
       query.exec(function(err, reports){
           if(err)
               res.send(err);

           // If no errors, respond with a JSON of all users that meet the criteria
           res.json(reports);
       });
   });

   // DELETE Routes (Dev Only)
   // --------------------------------------------------------
   // Delete a User off the Map based on objID
   app.delete('/reports/:objID', function(req, res){
       var objID = req.params.objID;
       var update = req.body;

       models.Police_Report.findByIdAndRemove(objID, update, function(err, report){
           if(err)
               res.send(err);
           res.json(req.body);
       });
   });
};
