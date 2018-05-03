angular.module('resetRequestController', ['userServices'])

.controller('resetRequestCtrl', function(User, $scope, $timeout, $location) {
  var app = this;

  app.loading = true; // Start loading icon on page load
  app.accessDenied = true; // Hide table while loading
  app.errorMsg = false; // Clear any error messages
  app.limit = 3; // Set a default limit to ng-repeat
  app.searchLimit = 0; // Set the default search page results limit to zero

    function getRequests(){

    User.getRequests().then(function(data){
       if (data.data.success) {
              // Check which permissions the logged in report has
              if (data.data.police_permission === 'main' || data.data.police_permission === 'station') {
                  app.account_resets = data.data.account_resets; // Assign reports from database to variable
                  app.loading = false; // Stop loading icon
                  app.accessDenied = false; // Show table
                  // Check if logged in report is an admin or moderator
                  if (data.data.police_permission === 'main') {
                    app.resetRequestPassword = false;
                    app.resetRequestUsername = false;
                    app.deleteRequestAccess = false;
                  } else if (data.data.police_permission === 'station') {
                    app.resetRequestPassword = true;
                    app.resetRequestUsername = true;
                    app.deleteRequestAccess = true;
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

  getRequests();
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


      // Function: Delete a user
    app.deleteRequest = function(account) {
       if (confirm('Are you sure you want to delete this?')) {
         // Run function to delete a user
         User.deleteRequest(account).then(function(data) {
             // Check if able to delete user
             if (data.data.success) {
                 getRequests(); // Reset users on page
             } else {
                 app.showMoreError = data.data.message; // Set error message
             }
         });
       }
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
