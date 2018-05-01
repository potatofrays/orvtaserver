angular.module('reportServices', [])

.factory('Report', function($http) {
    var reportFactory = {}; // Create the reportFactory object


    reportFactory.getFind = function(){
        return $http.get('/api/findReport/');
    };
    //get info
   reportFactory.getReports = function(id){
       return $http.get('/api/editReport2/' +id);
   }
   //edit
   reportFactory.reportChanges = function(id){
       return $http.put('/api/editReport2', id);
   }
   //get info
  reportFactory.getReports = function(id){
      return $http.get('/api/editReport/' +id);
  }
  //edit
  reportFactory.reportChanges = function(id){
      return $http.put('/api/editReport', id);
  }
    // Get people involved to then edit
    reportFactory.getPeopleInvolved = function(id) {
        return $http.get('/api/editPeopleInvolved/' + id);
    };
    // Edit a  people involved
    reportFactory.peopleChanges = function(id) {
        return $http.put('/api/editPeopleInvolved', id);
    };
    // Get vehicle to then edit
    reportFactory.getVehicle = function(id) {
        return $http.get('/api/editVehicle/' + id);
    };
    // Edit a vehicle
    reportFactory.vehicleChanges = function(id) {
        return $http.put('/api/editVehicle', id);
    };
    reportFactory.savePeople = function(id){
       return $http.put('/api/addPeople', id);
    }
   reportFactory.saveVehicle = function(id){
      return $http.put('/api/addVehicle', id);
    }
    reportFactory.getCitizenReports = function() {
        return $http.get('/api/citizenReportManagement/');
    };

      return reportFactory; // Return reportFactory object
  });
