angular.module('schedu.controllers', [])

.controller('ScheduleCtrl', function($scope, $ionicLoading, $state, UserDB, ClassOrder) {

    
    /////////////////////////////////
    // PERIOD LETTER SQUARE COLORS //
    /////////////////////////////////
    
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

    ///////////////////////
    // GENERATE SCHEDULE //
    ///////////////////////
    
    $ionicLoading.show({
      template: 'Loading...'
    });
    
    // Get user data object or "undefined"
    var localUser = localStorage.getItem('SchedUser');

    if (localUser == "undefined") {

        $ionicLoading.hide();
        $scope.noUserFound = true;
        $state.go("login");

    // Local user exists
    } else if (localUser !== null) {
        
        // Get day schedule in "A1" format
        ClassOrder.getDaySchedule().then(function (scheduleData) {
            $scope.dayOfWeek = scheduleData.dayOfWeek;
            $scope.todaysDate = scheduleData.todaysDate;
            $scope.daySchedule = scheduleData.daySchedule;
        });

        // Parse user data into object format
        var userData = JSON.parse(localUser);

        // Make schedule, hide loading overlay
        ClassOrder.make(userData, function (classOrder) {
            $scope.classOrder = classOrder;
            $ionicLoading.hide();
        });
        
    // No data in local storage, redirect to login page
    } else {

        $ionicLoading.hide();
        $state.go("login");
    }

    $scope.clearData = function () {
        localStorage.removeItem("SchedUser");
        $state.go("login");
    };

})

.controller('RegisterCtrl', function($scope, $state, $ionicLoading, $ionicPopup, UserDB, RegisterService) {

    $scope.register = function (formData) {

        var dayLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

        _.each(dayLetters, function (dayLetter, index, list) {

            var currentPeriod = formData[dayLetter];

            if (currentPeriod.days) {

                var bothClassDays = RegisterService.classDays(currentPeriod.days);
                currentPeriod.days = bothClassDays.primary;
                currentPeriod.alternate.days = bothClassDays.other;

            }

            formData[dayLetter] = currentPeriod;
        });


        $ionicLoading.show({
          template: 'Loading...'
        });

        ////////////////////////////////////////
        // CAPITALIZE FIRST LETTER OF STRINGS //
        ////////////////////////////////////////
        function capitalizeFirstLetter(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        formData.firstName = capitalizeFirstLetter(formData.firstName);
        formData.lastName = capitalizeFirstLetter(formData.lastName);
        _.each(dayLetters, function (dayLetter) {
            formData[dayLetter].name = capitalizeFirstLetter(formData[dayLetter].name);
        });

        ////////////////////////////////////////////////
        // ADD USER TO DATABASE, STORE, SHOW SCHEDULE //
        ////////////////////////////////////////////////
        UserDB.addUser(formData).then(function (response) {

            // Conflict, user already exists
            if (response.err.status == 409) {
                
                $ionicLoading.hide();
                $state.go("register");
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
            } else if (response.err) {

                $ionicLoading.hide();
                $state.go("register");
                $ionicPopup.show({
                    template: 'Something went wrong. Contact ' +
                                'info@getschedu.com if this keeps happening.',
                    title: 'Sorry!',
                    scope: $scope,
                    buttons: [
                      { text: 'Try again' }
                    ]
                });

            // No errors
            } else {
                // Store user data in local storage
                var localData = JSON.stringify(formData);
                window.localStorage.setItem('SchedUser', localData);

                $ionicLoading.hide();

                // Redirect to schedule page
                $state.go("schedule");
            }

        });
    };

})

.controller('LoginCtrl', function($scope, $state, UserDB, $ionicLoading) {


    $scope.submittedInvalid = false;
    $scope.submittedValid = false;

    $scope.login = function (loginForm, phoneNumber) {
        
        $ionicLoading.show({
          template: 'Loading...'
        });

        if (loginForm.phoneNumber.$valid) {

            $scope.submittedValid = true;

            // Get user data by phone number ID
            UserDB.getUser(phoneNumber).then(function (userData) {

                // Store user data in local storage
                var localData = JSON.stringify(userData);
                window.localStorage.setItem('SchedUser', localData);

                $ionicLoading.hide();

                if (localStorage.getItem('SchedUser') == "undefined") {
                    $scope.noUserFound = true;
                } else {
                    // Redirect to schedule page
                    $state.go("schedule");
                }

            });
        } else {
            $ionicLoading.hide();
            $scope.submittedInvalid = true;
        }

    };

})

.controller('FeedbackCtrl', function($scope, $state, $ionicLoading, FeedbackDB, UserDB) {

    $ionicLoading.show({
      template: 'Loading...'
    });

    // Get user data object or "undefined"
    var localUser = localStorage.getItem('SchedUser');

    // Redirect to login if no user data
    if (localUser == "undefined" || localUser == null) {
        $state.go("login");
        $ionicLoading.hide();
    } else {
        // Parse user data into object format
        var userData = JSON.parse(localUser);
    }

    // Get number of votes from user
    $scope.userVotes = userData.feedback.votes;

    $scope.feedbackVotes = [];
    
    // Retrieve feedback list from database, hide loader
    FeedbackDB.getList().then(function (data) {
        $scope.feedbackList = data['response'];
        $ionicLoading.hide();
    
        // Select user selections from previous sessions
        _.each(userData.feedback.voteItems, function (feedbackItem) {

            // Find matching item in actual list of feedback items
            var matchingItem = _.findWhere($scope.feedbackList, {"id": feedbackItem.id});

            if (matchingItem != undefined) {

                var matchingItemIndex = _.indexOf($scope.feedbackList, matchingItem);
                $scope.feedbackVotes[matchingItemIndex] = {
                    "selected": true,
                    "id": feedbackItem.id
                };
            }

        });
    });

    /**
     * Toggle vote status on a given item
     * @param  {Integer} index Index of tapped item in feedback list
     */
    $scope.voteOnItem = function (itemIndex, itemId) {

        // Decide if item is selected
        // If object exists for item
        if ($scope.feedbackVotes[itemIndex]) {

            var itemIsSelected = $scope.feedbackVotes[itemIndex].selected;

        // No object exists; can't be selected
        } else {
            var itemIsSelected = false;
        }

        // If not selected, set selected to 'true'
        if ($scope.userVotes > 0 && !itemIsSelected) {
            $scope.feedbackVotes[itemIndex] = {
                "selected": true,
                "id": itemId
            };
            $scope.userVotes--;
            syncVotes();

        // If selected, set 'selected' to false
        } else if (itemIsSelected) {
            $scope.feedbackVotes[itemIndex].selected = false;
            $scope.userVotes++;
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

        userData.feedback.voteItems = [];

        // Create array of only selected items
        _.each($scope.feedbackVotes, function (feedbackItem) {
            if (feedbackItem.selected === true) {
                userData.feedback.voteItems.push(feedbackItem);
            }
        });

        // Update and push data
        userData.feedback.votes = $scope.userVotes;
        UserDB.updateUser(userData).then(function () {
            UserDB.getUser(userData.phoneNumber).then(function (newUserData) {
                userData = newUserData;

                // Store user data in local storage
                var localData = JSON.stringify(userData);
                window.localStorage.setItem('SchedUser', localData);
            });
        });
    };
});
