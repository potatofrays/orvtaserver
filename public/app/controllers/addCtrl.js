// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice']);
addCtrl.controller('addCtrl', function($scope, $http, $rootScope, geolocation, gservice){
    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;
    var app = this;

    // Set initial coordinates to the center of the Pangasinan
    $scope.formData.longitude = -120.386395;
    $scope.formData.latitude = 15.7961094;
    $scope.formData.address_province = "Pangasinan";

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){

        // Set the latitude and longitude equal to the HTML5 coordinates
        coords = {lat: data.coords.latitude, long: data.coords.longitude};

        // Display coordinates in location textboxes rounded to three decimal points
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

        // Display message confirming that the coordinates verified.
        $scope.formData.htmlverified = "Please click anywhere in the map before adding a report!";

        gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

    });

    // Functions
    // ----------------------------------------------------------------------------

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){
        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
            $scope.formData.htmlverified = "Proceed on Reporting!";


        });
    });
    // Function for refreshing the HTML5 verified location (used by refresh button)
    $scope.refreshLoc = function(){
        geolocation.getLocation().then(function(data){
            coords = {lat:data.coords.latitude, long:data.coords.longitude};

            $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
            $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
            $scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";
            gservice.refresh(coords.lat, coords.long);
        });
    };
    //$scope.formData.location_municipality = document.getElementById('station').value;
    //$scope.formData.police_username = document.getElementById('policereporter').value;

    function showResult(result) {
    document.getElementById('latitude').value = result.geometry.location.lat().toFixed(3);
    document.getElementById('longitude').value = result.geometry.location.lng().toFixed(3);

    $scope.formData.longitude = parseFloat(result.geometry.location.lng()).toFixed(3);
    $scope.formData.latitude = parseFloat(result.geometry.location.lat()).toFixed(3);
}

$scope.formData.address_municipality = document.getElementById('Municipality').value;
$scope.formData.police_username = document.getElementById('Username').value;
    //getting the coordinates for the inserted address
    function getLatitudeLongitude(callback, address ) {

        address = address || 'Rizal Avenue, Bayambang, Pangasinan';


        // Initialize the Geocoder
        geocoder = new google.maps.Geocoder();
        if (geocoder) {
            geocoder.geocode({
                'address': address
            }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    callback(results[0]);
                }
            });
        }
    }

    var button = document.getElementById('btn');

    button.addEventListener("click", function () {
        var address = document.getElementById("Thoroughfare").value + ',' + document.getElementById("Municipality").value + ',' + document.getElementById("Province").value;
        getLatitudeLongitude(showResult, address)
    });

    // Creates a new user based on the form fields
    $scope.createReport = function() {
        // Grabs all of the text box fields
        var reportData = {
            accident_type: $scope.formData.type,
            accident_cause: $scope.formData.cause,
            address_thoroughfare:  $scope.formData.address_thoroughfare,
            address_municipality:  document.getElementById('Municipality').value,
            address_province: $scope.formData.address_province,
            location_coordinates: [$scope.formData.longitude, $scope.formData.latitude],
            committed_at: $scope.formData.committed_at,
            police_username: document.getElementById('Username').value,
            htmlverified: $scope.formData.htmlverified

        };

        // Saves the user data to the db
        $http.post('/police_reports', reportData)
            .success(function (data) {
              app.clickView = true;
              // Refresh the map with new data
              gservice.refresh($scope.formData.latitude, $scope.formData.longitude);

              // Once complete, clear the form (except location)
              $scope.formData.address_thoroughfare = "";
              $scope.showIdPeople = data.id;
              $scope.showIdVehicle = data.id;

            })
            .error(function (data) {
                console.log('Error: ' + data);
            });

        };
        $scope.addPeople = function(){
            var peopleObject ={};
            peopleObject._id = $scope.showIdPeople;
            peopleObject.people_involved_name = $scope.addName;
            peopleObject.people_involved_age = $scope.addAge;
            peopleObject.people_involved_citizenship = $scope.addCitizenship;
            peopleObject.people_involved_gender = $scope.addGender;
            peopleObject.people_involved_violation = $scope.addViolation;
            peopleObject.people_involved_status = $scope.addStatus;
            peopleObject.people_involved_type = $scope.addType;

            $http.put('/addPeople', peopleObject)
            .success(function(data){
                $scope.addName = "";
                $scope.addAge = "";
                $scope.addCitizenship = "";
                $scope.addGender = "";
                $scope.addViolation = "";
                $scope.addStatus = "";
                $scope.addType = "";
            })
        }

      $scope.addVehicle = function(){
        var vehicleObj = {};
        vehicleObj._id = $scope.showIdVehicle;
        vehicleObj.vehicle_platenumber = $scope.addPlatenumber;
        vehicleObj.vehicle_type = $scope.addVehicleType;
        vehicleObj.vehicle_brand = $scope.addBrand;
        vehicleObj.vehicle_model = $scope.addModel;

        $http.put('/addVehicle', vehicleObj)
        .success(function(data){
            $scope.addPlatenumber = "";
            $scope.addVehicleType = "";
            $scope.addBrand = "";
            $scope.addModel = ""

        })
    }

})
