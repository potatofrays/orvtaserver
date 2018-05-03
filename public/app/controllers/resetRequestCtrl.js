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

      // Function to send reset link to e-mail associated with username
      app.sendPassword = function(resetData, valid) {
          app.errorMsg = false; // Clear errorMsg
          app.loading = true; // Start loading icon
          app.disabled = true; // Disable form while processing

          // Check if form is valid
          if (valid) {
              // Runs function to send reset link to e-mail associated with username
              User.sendPassword(app.resetData).then(function(data) {
                  app.loading = false; // Stop loading icon
                  // Check if reset link was sent
                  if (data.data.success) {
                      $scope.alert = 'alert alert-success'; // Set success message class
                      app.successMsg = data.data.message; // Grab success message from JSON object
                      $timeout(function() {
                          app.successMsg = false; // Clear success message
                          app.disabled = false; // Enable form for editing
                      }, 2000);
                  } else {
                      $scope.alert = 'alert alert-danger'; // Set success message class
                      app.disabled = false; // Enable form to allow user to resubmit
                      app.errorMsg = data.data.message; // Grab error message from JSON object
                      $timeout(function() {
                          app.errorMsg = false; // Clear success message
                          app.disabled = false; // Enable form for editing
                      }, 2000);
                  }
              });
          } else {
              app.disabled = false; // Enable form to allow user to resubmit
              app.loading = false; // Stop loading icon
              $scope.alert = 'alert alert-danger'; // Set success message class
              app.errorMsg = 'Please enter a valid username'; // Let user know form is not valid
              $timeout(function() {
                  app.errorMsg = false; // Clear success message
                  app.disabled = false; // Enable form for editing
              }, 2000);
          }
      };
      // Function to send username to e-mail provided
      app.sendUsername = function(userData, valid) {
          app.errorMsg = false; // Clear errorMsg when user submits
          app.loading = true; // Start loading icon while processing
          app.disabled = true; // Disable form while processing

          // Only perform function if form is valid
          if (valid) {
              // Runs function to send username to e-mail provided
              User.sendUsername(app.userData.police_email).then(function(data) {
                  app.loading = false; // Stop loading icon
                  // Check if username was sent successfully to e-mail
                  if (data.data.success) {
                      $scope.alert = 'alert alert-success'; // Set success message class
                      app.successMsg = data.data.message; // If success, grab message from JSON object
                  } else {
                      app.disabled = false; // Enable form to allow user to retry
                      $scope.alert = 'alert alert-danger'; // Set alert class
                      app.errorMsg = data.data.message; // If error, grab message from JSON object
                  }
              });
          } else {
              app.disabled = false; // Enable form to allow user to retry
              app.loading = false; // Stop loading icon
              $scope.alert = 'alert alert-danger'; // Set alert class
              app.errorMsg = 'Please enter a valid e-mail'; // Let user know form is not valid
          }
      };

})
.controller('requestCtrl', function(User, $scope, $timeout) {

    app = this;

    // Function to send reset link to e-mail associated with username
    app.sendPassword = function(resetData, valid) {
        app.errorMsg = false; // Clear errorMsg
        app.loading = true; // Start loading icon
        app.disabled = true; // Disable form while processing

        // Check if form is valid
        if (valid) {
            // Runs function to send reset link to e-mail associated with username
            User.sendPassword(app.resetData).then(function(data) {
                app.loading = false; // Stop loading icon
                // Check if reset link was sent
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set success message class
                    app.successMsg = data.data.message; // Grab success message from JSON object
                    $timeout(function() {
                        app.successMsg = false; // Clear success message
                        app.disabled = false; // Enable form for editing
                    }, 2000);
                } else {
                    $scope.alert = 'alert alert-danger'; // Set success message class
                    app.disabled = false; // Enable form to allow user to resubmit
                    app.errorMsg = data.data.message; // Grab error message from JSON object
                    $timeout(function() {
                        app.errorMsg = false; // Clear success message
                        app.disabled = false; // Enable form for editing
                    }, 2000);
                }
            });
        } else {
            app.disabled = false; // Enable form to allow user to resubmit
            app.loading = false; // Stop loading icon
            $scope.alert = 'alert alert-danger'; // Set success message class
            app.errorMsg = 'Please enter a valid username'; // Let user know form is not valid
            $timeout(function() {
                app.errorMsg = false; // Clear success message
                app.disabled = false; // Enable form for editing
            }, 2000);
        }
    };
    // Function to send username to e-mail provided
    app.sendUsername = function(userData, valid) {
        app.errorMsg = false; // Clear errorMsg when user submits
        app.loading = true; // Start loading icon while processing
        app.disabled = true; // Disable form while processing

        // Only perform function if form is valid
        if (valid) {
            // Runs function to send username to e-mail provided
            User.sendUsername(app.userData.police_email).then(function(data) {
                app.loading = false; // Stop loading icon
                // Check if username was sent successfully to e-mail
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set success message class
                    app.successMsg = data.data.message; // If success, grab message from JSON object
                } else {
                    app.disabled = false; // Enable form to allow user to retry
                    $scope.alert = 'alert alert-danger'; // Set alert class
                    app.errorMsg = data.data.message; // If error, grab message from JSON object
                }
            });
        } else {
            app.disabled = false; // Enable form to allow user to retry
            app.loading = false; // Stop loading icon
            $scope.alert = 'alert alert-danger'; // Set alert class
            app.errorMsg = 'Please enter a valid e-mail'; // Let user know form is not valid
        }
    };
});
