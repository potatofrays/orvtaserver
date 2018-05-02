angular.module('reportManagementController', ['reportServices'])

// Controller: report to control the management page and managing of report accounts
.controller('reportManagementCtrl', function(Report, $scope) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsg = false; // Clear any error messages
    app.editReportAccess = false; // Clear access on load
    app.limit = 3; // Set a default limit to ng-repeat
    app.searchLimit = 0; // Set the default search page results limit to zero
    app.viewLoginBtn = false;

      function getFind(){
      Report.getFind().then(function(data){
         if (data.data.success) {
                // Check which permissions the logged in report has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.police_reports = data.data.police_reports; // Assign reports from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    // Check if logged in report is an admin or moderator
                    if (data.data.police_permission === 'main') {
                      app.addWalkInAccess = false;
                      app.permissionAccess = true;
                      app.stationAccess = true;
                      app.mainAccess = true
                      app.viewAccess = true;
                    } else if (data.data.police_permission === 'station') {
                      app.addWalkInAccess = true;
                      app.editReportAccess = true; // Show edit button
                      app.permissionAccess = false;
                      app.viewAccess = false;
                      app.userAccess = true;
                      app.viewLoginBtn = false;
                      app.generateReportAccess = true;
                    }
                } else {
                    app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                    app.loading = false; // Stop loading icon
                }
            } else {
                app.errorMsg = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
              }
      });
    }
    getFind();
    // Function: Show more results on page
    app.showMore = function(number) {
        app.showMoreError = false; // Clear error message
        // Run functio only if a valid number above zero
        if (number > 0) {
            app.limit = number; // Change ng-repeat filter to number requested by report
        } else {
            app.showMoreError = 'Please enter a valid number'; // Return error if number not valid
        }
    };

    // Function: Show all results on page
    app.showAll = function() {
        app.limit = undefined; // Clear ng-repeat limit
        app.showMoreError = false; // Clear error message
    };


    // Function: Perform a basic search function
    app.search = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limit = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the report
                app.limit = number; // Set the number displayed to the number entered by the report
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limit = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limit = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clear = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limit = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreError = false; // Clear any errors
    };

})
// Controller: Used to edit reports
.controller('editReportCtrl', function($scope, $routeParams, Report, $timeout) {
    var app = this;
    //get all data and display to form
    Report.getReports($routeParams.id).then(function(data){
        if(data.data.success){
            $scope.editCommittedAt = data.data.report.committed_at;
            $scope.editAccidentType = data.data.report.accident_type;
            $scope.editAccidentCause = data.data.report.accident_cause;
            $scope.editThoroughfare = data.data.report.address_thoroughfare;
            $scope.editMunicipality = data.data.report.address_municipality;
            $scope.editProvince = data.data.report.address_province;
            $scope.editCredibility = data.data.report.report_credibility;
            $scope.showId = data.data.report._id;
            $scope.showIdPeople = data.data.report._id;
            $scope.showIdVehicle = data.data.report._id;
        }
    });
    //function for button Save Changes
    app.updateReport = function(valid, editCommittedAt, editAccidentType, editDate, editAccidentCause, editThoroughfare, editMunicipality, editProvince, editCredibility){
        if(valid){
            var reportObject = {};
            reportObject._id = $scope.showId;
            reportObject.committed_at = $scope.editCommittedAt;
            reportObject.accident_type = $scope.editAccidentType;
            reportObject.accident_cause = $scope.editAccidentCause;
            reportObject.address_thoroughfare = $scope.editThoroughfare;
            reportObject.address_municipality = $scope.editMunicipality;
            reportObject.address_province = $scope.editProvince;
            reportObject.report_credibility = $scope.editCredibility;
        //userObject - to validate first the field to be updated then use route
        // to use the route created for editting
        Report.reportChanges(reportObject).then(function(data){
          if (data.data.success) {
            $scope.alert = 'alert alert-success'; // Set class for message
            app.successMsg = data.data.message; // Set success message
            // Function: After two seconds, clear and re-enable
            $timeout(function() {
                app.successMsg = false; // Clear success message
                app.disabled = false; // Enable form for editing
            }, 2000);
          } else {
              $scope.alert = 'alert alert-danger'; // Set class for message
              app.errorMsg = data.data.message; // Clear any error messages

              // Function: After two seconds, clear and re-enable
              $timeout(function() {
                  app.errorMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
          }
        });
      } else {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
        app.disabled = false; // Enable form for editing
        $timeout(function() {
            app.errorMsg = false; // Clear success message
            app.disabled = false; // Enable form for editing
        }, 2000);
      }
    }
    //function for button Save Changes
    app.updateCitizenReport = function(valid, editCommittedAt, editAccidentType, editDate, editAccidentCause, editThoroughfare, editMunicipality, editProvince, editCredibility){
        if(valid){
            var reportObject = {};
            reportObject._id = $scope.showId;
            reportObject.committed_at = $scope.editCommittedAt;
            reportObject.accident_type = $scope.editAccidentType;
            reportObject.accident_cause = $scope.editAccidentCause;
            reportObject.address_thoroughfare = $scope.editThoroughfare;
            reportObject.address_municipality = $scope.editMunicipality;
            reportObject.address_province = $scope.editProvince;
            reportObject.report_credibility = $scope.editCredibility;
            reportObject.police_username - document.getElementById('username').value;
        //userObject - to validate first the field to be updated then use route
        // to use the route created for editting
        Report.citizeneportChanges(reportObject).then(function(data){
          if (data.data.success) {
            $scope.alert = 'alert alert-success'; // Set class for message
            app.successMsg = data.data.message; // Set success message
            // Function: After two seconds, clear and re-enable
            $timeout(function() {
                app.successMsg = false; // Clear success message
                app.disabled = false; // Enable form for editing
            }, 2000);
          } else {
              $scope.alert = 'alert alert-danger'; // Set class for message
              app.errorMsg = data.data.message; // Clear any error messages

              // Function: After two seconds, clear and re-enable
              $timeout(function() {
                  app.errorMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
          }
        });
      } else {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
        app.disabled = false; // Enable form for editing
        $timeout(function() {
            app.errorMsg = false; // Clear success message
            app.disabled = false; // Enable form for editing
        }, 2000);
      }
    }

    app.addPeople = function(valid,showIdPeople, addName, addAge, addCitizenship, addGender, addViolation, addStatus, addType){
        if(valid){
            var peopleObject ={};
            peopleObject._id = $scope.showId;
            peopleObject.people_involved_name = $scope.addName;
            peopleObject.people_involved_age = $scope.addAge;
            peopleObject.people_involved_citizenship = $scope.addCitizenship;
            peopleObject.people_involved_gender = $scope.addGender;
            peopleObject.people_involved_violation = $scope.addViolation;
            peopleObject.people_involved_status = $scope.addStatus;
            peopleObject.people_involved_type = $scope.addType;

        Report.savePeople(peopleObject).then(function(data){
            if(data.data.success){
                $scope.addName = "";
                $scope.addAge = "";
                $scope.addCitizenship = "";
                $scope.addGender = "";
                $scope.addViolation = "";
                $scope.addStatus = "";
                $scope.addType = "";
            }
        });
      }
    }

    app.addVehicle = function(valid, showIdVehicle, addPlateNumber, addBrand, addVehicleType, addModel){
        if(valid){
            var vehicleObject ={};
            vehicleObject._id = $scope.showId;
            vehicleObject.vehicle_platenumber = $scope.addPlateNumber;
            vehicleObject.vehicle_brand = $scope.addBrand;
            vehicleObject.vehicle_type = $scope.addVehicleType;
            vehicleObject.vehicle_model = $scope.addModel;

        Report.saveVehicle(vehicleObject).then(function(data){
            if(data.data.success){
                $scope.addPlateNumber = "";
                $scope.addBrand = "";
                $scope.addVehicleType = "";
                $scope.addModel = "";
            }
        });
      }
    }
})
.controller('editCitizenReportCtrl', function($scope, $routeParams, Report, $timeout) {
    var app = this;
    //get all data and display to form
    Report.getReports($routeParams.id).then(function(data){
        if(data.data.success){
            $scope.editCommittedAt = data.data.report.committed_at;
            $scope.editAccidentType = data.data.report.accident_type;
            $scope.editAccidentCause = data.data.report.accident_cause;
            $scope.editThoroughfare = data.data.report.address_thoroughfare;
            $scope.editMunicipality = data.data.report.address_municipality;
            $scope.editProvince = data.data.report.address_province;
            $scope.editCredibility = data.data.report.report_credibility;
            $scope.showId = data.data.report._id;
            $scope.showIdPeople = data.data.report._id;
            $scope.showIdVehicle = data.data.report._id;
        }
    });
    //function for button Save Changes
    app.updateReport = function(valid, editCommittedAt, editAccidentType, editDate, editAccidentCause, editThoroughfare, editMunicipality, editProvince, editCredibility){
        if(valid){
            var reportObject = {};
            reportObject._id = $scope.showId;
            reportObject.committed_at = $scope.editCommittedAt;
            reportObject.accident_type = $scope.editAccidentType;
            reportObject.accident_cause = $scope.editAccidentCause;
            reportObject.address_thoroughfare = $scope.editThoroughfare;
            reportObject.address_municipality = $scope.editMunicipality;
            reportObject.address_province = $scope.editProvince;
            reportObject.report_credibility = $scope.editCredibility;
            reportObject.police_username = document.getElementById('username').value;
        //userObject - to validate first the field to be updated then use route
        // to use the route created for editting
        Report.reportChanges(reportObject).then(function(data){
          if (data.data.success) {
            $scope.alert = 'alert alert-success'; // Set class for message
            app.successMsg = data.data.message; // Set success message
            // Function: After two seconds, clear and re-enable
            $timeout(function() {
                app.successMsg = false; // Clear success message
                app.disabled = false; // Enable form for editing
            }, 2000);
          } else {
              $scope.alert = 'alert alert-danger'; // Set class for message
              app.errorMsg = data.data.message; // Clear any error messages

              // Function: After two seconds, clear and re-enable
              $timeout(function() {
                  app.errorMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
          }
        });
      } else {
        $scope.alert = 'alert alert-danger'; // Set class for message
        app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
        app.disabled = false; // Enable form for editing
        $timeout(function() {
            app.errorMsg = false; // Clear success message
            app.disabled = false; // Enable form for editing
        }, 2000);
      }
    }

    app.addPeople = function(valid,showIdPeople, addName, addAge, addCitizenship, addGender, addViolation, addStatus, addType){
        if(valid){
            var peopleObject ={};
            peopleObject._id = $scope.showId;
            peopleObject.people_involved_name = $scope.addName;
            peopleObject.people_involved_age = $scope.addAge;
            peopleObject.people_involved_citizenship = $scope.addCitizenship;
            peopleObject.people_involved_gender = $scope.addGender;
            peopleObject.people_involved_violation = $scope.addViolation;
            peopleObject.people_involved_status = $scope.addStatus;
            peopleObject.people_involved_type = $scope.addType;

        Report.savePeople(peopleObject).then(function(data){
            if(data.data.success){
                $scope.addName = "";
                $scope.addAge = "";
                $scope.addCitizenship = "";
                $scope.addGender = "";
                $scope.addViolation = "";
                $scope.addStatus = "";
                $scope.addType = "";
            }
        });
      }
    }

    app.addVehicle = function(valid, showIdVehicle, addPlateNumber, addBrand, addVehicleType, addModel){
        if(valid){
            var vehicleObject ={};
            vehicleObject._id = $scope.showId;
            vehicleObject.vehicle_platenumber = $scope.addPlateNumber;
            vehicleObject.vehicle_brand = $scope.addBrand;
            vehicleObject.vehicle_type = $scope.addVehicleType;
            vehicleObject.vehicle_model = $scope.addModel;

        Report.saveVehicle(vehicleObject).then(function(data){
            if(data.data.success){
                $scope.addPlateNumber = "";
                $scope.addBrand = "";
                $scope.addVehicleType = "";
                $scope.addModel = "";
            }
        });
      }
    }
})
.controller('editMultipleCtrl', function($scope, $routeParams, Report, $timeout) {
    var app = this;
    // Function: get the people involved that needs to be edited
    Report.getPeopleInvolved($routeParams.id).then(function(data) {
        // Check if the people involve's _id was found in database
        if (data.data.success) {
            $scope.addName = data.data.people.people_involved_name; // Display name in scope
            $scope.addAge = data.data.people.people_involved_age; // Display age in scope
            $scope.addGender = data.data.people.people_involved_gender; // Display gender in scope
            $scope.addCitizenship = data.data.people.people_involved_citizenship; // Display citizenship in scope
            $scope.addStatus = data.data.people.people_involved_status; // Display status in scope
            $scope.addViolation = data.data.people.people_involved_violation; // Display status in scope
            $scope.addType = data.data.people.people_involved_type; // Display status in scope
            $scope.showId = data.data.people._id; // Get report's _id for update functions
        } else {
            app.errorMsg = data.data.message; // Set error message
            $scope.alert = 'alert alert-danger'; // Set class for message
        }
    });
    app.updatePeople = function(valid, addName, addAge, addGender, addCitizenship, addViolation, addStatus, addType){
       if(valid){
          var peopleObject = {};
          peopleObject._id = $scope.showId;
          peopleObject.people_involved_name = $scope.addName;
          peopleObject.people_involved_age = $scope.addAge;
          peopleObject.people_involved_gender = $scope.addGender
          peopleObject.people_involved_citizenship = $scope.addCitizenship;
          peopleObject.people_involved_violation = $scope.addViolation;
          peopleObject.people_involved_status = $scope.addStatus;
          peopleObject.people_involved_type = $scope.addType;

         Report.peopleChanges(peopleObject).then(function(data){
           if (data.data.success) {
             $scope.alert = 'alert alert-success'; // Set class for message
             app.successMsg = data.data.message; // Set success message
             // Function: After two seconds, clear and re-enable
             $timeout(function() {
                 app.successMsg = false; // Clear success message
                 app.disabled = false; // Enable form for editing
             }, 2000);
           } else {
               $scope.alert = 'alert alert-danger'; // Set class for message
               app.errorMsg = data.data.message; // Clear any error messages

               // Function: After two seconds, clear and re-enable
               $timeout(function() {
                   app.errorMsg = false; // Clear success message
                   app.disabled = false; // Enable form for editing
               }, 2000);
           }
         });
       } else {
         $scope.alert = 'alert alert-danger'; // Set class for message
         app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
         app.disabled = false; // Enable form for editing
         $timeout(function() {
             app.errorMsg = false; // Clear success message
             app.disabled = false; // Enable form for editing
         }, 2000);
       }
     }
     // Function: get the people involved that needs to be edited
     Report.getVehicle($routeParams.id).then(function(data) {
         // Check if the people involve's _id was found in database
         if (data.data.success) {
             $scope.addPlateNumber = data.data.vehicle.vehicle_platenumber; // Display name in scope
             $scope.addBrand = data.data.vehicle.vehicle_brand; // Display age in scope
             $scope.addVehicleType = data.data.vehicle.vehicle_type; // Display gender in scope
             $scope.addModel = data.data.vehicle.vehicle_model; // Display citizenship in scope
             $scope.showId = data.data.vehicle._id; // Get report's _id for update functions
         } else {
             app.errorMsg = data.data.message; // Set error message
             $scope.alert = 'alert alert-danger'; // Set class for message
         }
     });
     app.updateVehicle = function(valid, addPlateNumber, addBrand, addVehicleType, addModel){
        if(valid){
           var vehicleObject = {};
           vehicleObject._id = $scope.showId;
           vehicleObject.vehicle_platenumber = $scope.addPlateNumber;
           vehicleObject.vehicle_brand = $scope.addBrand;
           vehicleObject.vehicle_model= $scope.addModel;
           vehicleObject.vehicle_type = $scope.addVehicleType

          Report.vehicleChanges(vehicleObject).then(function(data){
            if (data.data.success) {
              $scope.alert = 'alert alert-success'; // Set class for message
              app.successMsg = data.data.message; // Set success message
              // Function: After two seconds, clear and re-enable
              $timeout(function() {
                  app.successMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = data.data.message; // Clear any error messages

                // Function: After two seconds, clear and re-enable
                $timeout(function() {
                    app.errorMsg = false; // Clear success message
                    app.disabled = false; // Enable form for editing
                }, 2000);
            }
          });
        } else {
          $scope.alert = 'alert alert-danger'; // Set class for message
          app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
          app.disabled = false; // Enable form for editing
          $timeout(function() {
              app.errorMsg = false; // Clear success message
              app.disabled = false; // Enable form for editing
          }, 2000);
        }
      }
})
.controller('citizenReportManagementCtrl', function(Report, $scope) {
    var app = this;

    app.loading = true; // Start loading icon on page load
    app.accessDenied = true; // Hide table while loading
    app.errorMsg = false; // Clear any error messages
    app.editCitizenReportAccess = false; // Clear access on load
    app.limit = 3; // Set a default limit to ng-repeat
    app.searchLimit = 0; // Set the default search page results limit to zero

    // Function: get all the reports from database
    function getCitizenReports() {
        // Runs function to get all the reports from database
        Report.getCitizenReports().then(function(data) {
            // Check if able to get data from database
            if (data.data.success) {
                // Check which permissions the logged in report has
                if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                    app.police_reports = data.data.police_reports; // Assign reports from database to variable
                    app.loading = false; // Stop loading icon
                    app.accessDenied = false; // Show table
                    // Check if logged in report is an admin or moderator
                    if (data.data.police_permission === 'main') {
                        app.viewAccess = true;
                    } else if (data.data.police_permission === 'station') {;
                    }
                } else {
                    app.errorMsg = 'Insufficient Permissions'; // Reject edit and delete options
                    app.loading = false; // Stop loading icon
                }
            } else {
                app.errorMsg = data.data.message; // Set error message
                app.loading = false; // Stop loading icon
            }
        });
    }


    getCitizenReports(); // Invoke function to get reports from databases

    // Function: Show more results on page
    app.showMore = function(number) {
        app.showMoreError = false; // Clear error message
        // Run functio only if a valid number above zero
        if (number > 0) {
            app.limit = number; // Change ng-repeat filter to number requested by report
        } else {
            app.showMoreError = 'Please enter a valid number'; // Return error if number not valid
        }
    };

    // Function: Show all results on page
    app.showAll = function() {
        app.limit = undefined; // Clear ng-repeat limit
        app.showMoreError = false; // Clear error message
    };


    // Function: Perform a basic search function
    app.search = function(searchKeyword, number) {
        // Check if a search keyword was provided
        if (searchKeyword) {
            // Check if the search keyword actually exists
            if (searchKeyword.length > 0) {
                app.limit = 0; // Reset the limit number while processing
                $scope.searchFilter = searchKeyword; // Set the search filter to the word provided by the report
                app.limit = number; // Set the number displayed to the number entered by the report
            } else {
                $scope.searchFilter = undefined; // Remove any keywords from filter
                app.limit = 0; // Reset search limit
            }
        } else {
            $scope.searchFilter = undefined; // Reset search limit
            app.limit = 0; // Set search limit to zero
        }
    };

    // Function: Clear all fields
    app.clear = function() {
        $scope.number = 'Clear'; // Set the filter box to 'Clear'
        app.limit = 0; // Clear all results
        $scope.searchKeyword = undefined; // Clear the search word
        $scope.searchFilter = undefined; // Clear the search filter
        app.showMoreError = false; // Clear any errors
    };

});
