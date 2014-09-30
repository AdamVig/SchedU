angular.module('schedu.controllers', [])

.controller('ScheduleCtrl', function($scope, LoadingFactory, $state, DataService, StorageService, ClassOrderFactory, DateFactory) {

    // Set date toggle variable
    $scope.dateShow = false;
    
    // From FlatUI Colors
    $scope.dayLetterColors = {
        "A": {"background-color": "#D362E8"},
        "B": {"background-color": "#2ecc71"},
        "C": {"background-color": "#e67e22"},
        "D": {"background-color": "#9b59b6"},
        "E": {"background-color": "#e74c3c"},
        "F": {"background-color": "#f1c40f"},
        "G": {"background-color": "#3498db"},
        "Sp": {"background-color": "#34495e"}
    };
    
    LoadingFactory.show();
    
    // Get user data object or "undefined"
    var localUser = StorageService.getUser();

    if (localUser) {

        // Create and format date
        var date = DateFactory.currentDay();
        var dateString = date.format('MM-DD-YY');
        $scope.formattedDate = DateFactory.formatDate(date);
        
        // Get schedule, parse into A1 format, then make class order
        DataService.getSchedule(dateString).then(function (response) {

            var scheduleObject = response.data;

            // Parse schedule object into A1 format
            $scope.scheduleString = ClassOrderFactory.parseSchedule(scheduleObject);

            // Make class order, hide loader
            $scope.classOrder = ClassOrderFactory.make(localUser, scheduleObject);
            LoadingFactory.hide();
        });

    // No data in local storage, redirect to login page
    } else {

        LoadingFactory.hide();
        $scope.noUserFound = true;
        $state.go("login");
    }

})

.controller('RegisterCtrl', function($scope, $state, LoadingFactory, $ionicPopup, DataService, ClassDaysFactory, StorageService) {

    $scope.periodLetters = ['a','b','c','d','e','f','g'];

    $scope.register = function (formData) {

        // Figure out class days for all periods
        formData = ClassDaysFactory.make(formData);

        LoadingFactory.show();
        


        ////////////////////////////////////////////////
        // ADD USER TO DATABASE, STORE, SHOW SCHEDULE //
        ////////////////////////////////////////////////
        
        DataService.createUser(formData).then(function (response) {

            // Conflict, user already exists
            if (response.error.status == 409) {
                
                LoadingFactory.hide();
                $ionicPopup.show({
                    template: 'A user already exists with this phone number. ' + 
                                'Is it you? You can either change your phone ' +
                                'number or try to login using this phone number.',
                    title: 'Oh no!',
                    scope: $scope,
                    buttons: [
                      { text: 'I\'ll change my number' },
                      {
                        text: 'Let me login',
                        type: 'button-positive',
                        onTap: function(e) {
                          $state.go("login");
                        }
                      },
                    ]
                });

            // Unknown error
            } else if (response.error) {

                LoadingFactory.hide();
                $ionicPopup.show({
                    template: 'Something went wrong. Contact ' +
                              'info@getschedu.com if this keeps happening.',
                    title: 'Sorry!',
                    scope: $scope,
                    buttons: [
                        {text: 'Try again'}
                    ]
                });

            // No errors
            } else {
                
                StorageService.storeUser(formData);
                LoadingFactory.hide();

                // Redirect to schedule page
                $state.go("schedule");
            }

        });
    };

})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, LoadingFactory, DataService, StorageService) {


    $scope.submittedInvalid = false;
    $scope.submittedValid = false;

    $scope.login = function (loginForm, phoneNumber) {

        // Reset errors
        $scope.submittedInvalid = false;
        $scope.submittedValid = false;
        $scope.noUserFound = false;
        $scope.unknownError = false;

        LoadingFactory.show();

        if (loginForm.phoneNumber.$valid) {

            $scope.submittedValid = true;

            // Get user data by phone number ID
            DataService.getUser(phoneNumber).then(function (response) {

                LoadingFactory.hide();

                if (!response.error) {
                    // Store user data in local storage
                    StorageService.storeUser(response.data);

                    // Redirect to schedule page
                    $state.go("schedule");
                } else if (response.error.status == 404) {
                    // Show "not found" error message
                    $scope.noUserFound = true;
                } else {
                    // Show general error message
                    $scope.unknownError = true;
                }
            });

        } else {
            LoadingFactory.hide();
            $scope.submittedInvalid = true;
        }

    };

})

.controller('FeedbackCtrl', function($scope, $state, LoadingFactory, DataService, StorageService) {

    LoadingFactory.show();

    // Get user data object (false if not available)
    var localUser = StorageService.getUser();

    // Redirect to login if no user data
    if (!localUser) {
        $state.go("login");
        LoadingFactory.hide();
    }

    // Get number of votes from user
    $scope.feedback = localUser.feedback;
    
    // Retrieve feedback items list from database, hide loader
    DataService.getFeedbackItems().then(function (response) {
        $scope.feedbackItems = response.data;
        LoadingFactory.hide();
    });

    /**
     * Toggle vote status on a given item
     * @param  {Integer} index Index of tapped item in feedback list
     */
    $scope.voteOnItem = function (itemId) {

        var itemIsSelected = _.contains($scope.feedback.voteItems, itemId);

        // If not selected, add to list of selected items
        if ($scope.feedback.votes > 0 && !itemIsSelected) {

            // Add item to voteItems list
            $scope.feedback.voteItems.push(itemId);

            // Decrement number of votes left
            $scope.feedback.votes--;

            syncVotes();

        // If selected, remove from list of selected items
        } else if (itemIsSelected) {

            // Remove item from voteItems list
            $scope.feedback.voteItems = _.without($scope.feedback.voteItems, itemId);

            // Add a vote back
            $scope.feedback.votes++;

            syncVotes();

        // No votes left
        } else {
            $ionicLoading.show({
                template: 'Sorry, you\'re out of votes! Try deselecting a feature.', 
                noBackdrop: false, 
                duration: 1500 
            });
        }
    };

    /**
     * Sync user's vote data to database
     */
    var syncVotes = function () {

        LoadingFactory.show();

        localUser.feedback = $scope.feedback;
        DataService.syncUser(localUser).then(function (response) {
            localUser = response.data;
            LoadingFactory.hide();
        });
    };
});
