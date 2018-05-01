var Police_User = require('../models/user'); 
var mongoose = require('mongoose');
var models = require('../models/police_reports');
var Account_Reset = require('../models/accountReset');

module.exports = function(router){
	//route for login
	router.get('/login/:username/:password', function(req, res){
		Police_User.findOne({police_username: req.params.username},{police_password: req.params.password}, function(err, user){
			if (err) {
		            res.json({ success: false, message: err });
			}else{
				if (!user) {
		            res.json({ success: false, message: 'Username not found' }); // Username not found in database
		        } else if (user) {
		            // Check if user does exist, then compare password provided by user
			        if (!req.params.password) {
			            res.json({ success: false, message: 'No password provided' }); // Password was not provided
			        } else {
			            var validPassword = user.comparePassword(req.params.password); // Check if password matches password provided by user
					        if (!validPassword) {
					            res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
					        } else {
					        	Police_User.findOne({police_username: req.params.username}, function(err, username){
					          		return res.json({ success: true, username: username.police_username, police_id: username.id, police_station: username.police_station}); // Return token in JSON object to controller
					       		});
					        }
					}
				}
			}
		});
	});

	//add
	//route for creating report(first to submitted)
	router.post('/report', function(req,res){
		var addReport = new models.Police_Report();
			addReport.committed_at = req.body.committed_at;
			addReport.reported_at = req.body.reported_at;
			addReport.accident_type = req.body.accident_type;
			addReport.accident_cause = req.body.accident_cause;
			addReport.police_username = req.body.police_username;
			addReport.report_credibility = "Factual";
			addReport.save(function(err, report){
				if(err){
					res.json(500,err);
				}else{
					res.json({success: true, report_id: report.id});
				}
			});
	});
	//add
	//add location
	router.put('/location/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, location){
			location.location_coordinates = [req.body.location_longitude, req.body.location_latitude];
			location.address_thoroughfare = req.body.address_thoroughfare;
			location.address_municipality = req.body.address_municipality;
			location.address_province = req.body.address_province;
			location.save();
			if(err){
				req.json(500,err);
			}else{
				res.json({success:true});
			}
		});
	});
	//add
	//route for adding people involve
	router.put('/people_involved/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, people){
			var addPeople = new models.People_Involved();
				addPeople.people_involved_age = req.body.people_involved_age;
				addPeople.people_involved_name = req.body.people_involved_name;
				addPeople.people_involved_gender = req.body.people_involved_gender;
				addPeople.people_involved_citizenship = req.body.people_involved_citizenship;
				addPeople.people_involved_status = req.body.people_involved_status;
				addPeople.violation_committed = req.body.violation_committed;
				//addPeople.people_involved_type = req.body.people_involved_type; //walk in
				addPeople.save();
					if(err){
						res.json(500, err);
					}else if(people){
						people.people_involved_id.push(addPeople);
						people.save();
							res.json({success:true});
					}
			});
		});

	//add
	//route for saving vehicle
	router.put('/vehicle/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, vehicle){
			var addVehicle = new models.Vehicle();
				addVehicle.vehicle_type = req.body.vehicle_type;
				addVehicle.vehicle_platenumber = req.body.vehicle_platenumber;
				addVehicle.vehicle_brand = req.body.vehicle_brand;
				addVehicle.vehicle_model = req.body.vehicle_model;
				addVehicle.save();
					if(err){
						res.json(500, err);
					}else if(vehicle){
						vehicle.vehicle_id.push(addVehicle);
						vehicle.save();
							res.json({success: true});
					}
				});
		});

	//fraud
	router.put('/fraud/:id', function(req, res){
		models.Police_Report.findById(req.params.id, function(err,fraud){
			fraud.report_credibility = "Fraud";
			fraud.save();
			if (err) {
				res.json(500,err);
			}
				res.json({success: true});
		});
	});
	//fraud
	router.put('/factual/:id', function(req, res){
		models.Police_Report.findById(req.params.id, function(err,factual){
			factual.report_credibility = "Factual";
			factual.save(function(err, fact){
			if (err) {
				res.json(500,err);
			}
				res.json({success: true, factual:fact.id});
			});
		});
	});

	//update report
	router.put('/report/:id', function(req,res){
		models.Police_Report.findById(req.params.id, function(err, updateReport){
			updateReport.committed_at = req.body.committed_at;
			updateReport.reported_at = req.body.committed_at;
			updateReport.accident_type = req.body.accident_type;
			updateReport.accident_cause = req.body.accident_cause;
			updateReport.police_username = req.body.police_username;
			updateReport.save(function(err, report){
				if(err){
					res.json(500,err);
				}else{
					res.json({success: true, id: report.id});
				}
			});
		});
	});


	//send reset request
	router.post('/request', function(req,res){
		var addRequest = new Account_Reset();
		addRequest.account = req.body.account;
		addRequest.resetType =req.body.resetType;
		addRequest.save(function(err){
			if (err) {
				res.json(500,err);
			}
				res.json({success: true});
		});
	});

	//display all pending
	router.get('/pending', function(req, res){
		models.Police_Report.find({report_credibility: 'Pending'},  function(err, pending){
			if(err){
				res.json(500, err);
			}else{
				res.json(pending);
			}
		});
	});

	//display data for people_involved
	router.get('/display', function(req, res){
		models.Police_Report.findOne({ _id: req.params.id})
			.populate({path: 'people_involved_id', model:'People_Involved'})
			.populate({path:'vehicle_id', model: 'Vehicle'})
			.exec(function(err, report) {
    			if (err){
    				return handleError(err);
    			}else{
     				res.json({report: report});
    			}
			});
	});



return router;
}
