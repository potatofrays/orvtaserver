var mongoose = require('mongoose');
var models = require('../models/police_reports');

module.exports = function(router){
	router.post('/citizenReport', function(req, res){
		var citizenreport = new models.Police_Report();
			citizenreport.location_coordinates = [req.body.location_longitude, req.body.location_latitude];
			citizenreport.address_thoroughfare = req.body.address_thoroughfare;
			citizenreport.address_municipality = req.body.address_municipality;
			citizenreport.address_province = req.body.address_province;
			citizenReport.citizen_reported_at = req.body.citizen_reported_at;
			citizenreport.report_credibility = "Pending";
			citizenreport.save(function(err, report){
			if(err){
				res.json(500,err);
			}else{
			res.json({success:true, report: report});
			}
		});
	});

	return router;
}
