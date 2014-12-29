angular.module('schedu.controllers', [])

.controller('ScheduleCtrl', function($scope, $rootScope, $state, $q, LoadingFactory, DataService, StorageService, ClassOrderFactory, DateFactory, UsageFactory, SyncUserFactory) {

  LoadingFactory.show();
  $scope.testingNetwork = false;
  $scope.dateShow = false;

  $scope.logout = function () {
    LoadingFactory.show();
    StorageService.deleteUser();
    $state.go("login");
    LoadingFactory.hide();
  };

  // Get user data object or "undefined"
  var localUser = StorageService.getUser();

  if (localUser) {

    ///////////////////////
    // RETRIEVE SCHEDULE //
    ///////////////////////

    // Create and format date
    var date = DateFactory.currentDay();

    var dateString = date.format('MM-DD-YY');
    $scope.formattedDate = DateFactory.formatDate(date);

    // Get schedule, parse into A1 format, then make class order
    DataService.getSchedule(dateString).then(function (response) {

      if (!response.error) {

        // Parse schedule object into A1 format
        $scope.scheduleString = ClassOrderFactory.makeScheduleString(response.data);

        // Make class order, hide loader
        $scope.classOrder = ClassOrderFactory.make(localUser, response.data);

        LoadingFactory.hide();

        // Update usage
        localUser.usage = UsageFactory.get(localUser.usage);

        return SyncUserFactory.sync(localUser);

      } else if (!$scope.online) {

        LoadingFactory.quickHide();
        LoadingFactory.showNoConnection();

        return $q.reject("No network connection.");

      } else {

        LoadingFactory.hide();
        return $q.reject("Unknown error.");
      }

      //////////////////////////
      // SYNC USER USAGE DATA //
      //////////////////////////

    }).then(function (response) {

      // Successful sync; store user
      if (!response.error) {
        localUser = response.data;
        StorageService.storeUser(response.data);

      // User doesn't exist in database
      } else if (response.error.status == 404) {
        $state.go("login");
        LoadingFactory.hide();
        $scope.noUserFound = true;
      }

    });

  // No data in local storage, redirect to login page
  } else {

    $state.go("login");
    LoadingFactory.hide();
    $scope.noUserFound = true;

  }

})

.controller('NetworkCtrl', function ($scope, $state, $timeout, LoadingFactory) {

  $scope.testNetwork = function () {

    $scope.testingNetwork = true;
    $scope.checkOnLine();

    // Attempt to find network connection
    $timeout(function () {

      // Try connection
      if ($scope.online) {
        $state.reload();
        LoadingFactory.hide();
      }

      // Reset value
      $scope.testingNetwork = false;

    }, 1000);

  };
})

.controller('RegisterCtrl', function($scope, $state, $filter, LoadingFactory, $ionicPopup, DataService, StorageService, PhoneNumberFactory, RegistrationFactory) {

  $scope.formData = {};
  $scope.periodLetters = ['a','b','c','d','e','f','g'];

  /**
   * Deselect currently selected day in alternate class
   * @param  {integer} dayNumber    Number of the selected day
   * @param  {string}  periodLetter Letter of the current period
   * @param  {boolean} alternate    (Optional) Either 'alternate' or not provided
   */
  $scope.deselectDays = function (dayNumber, periodLetter, alternate) {

    // Primary day:
    // 1. Remove day number from alternate days array
    // 2. Add day number to primary days array
    if (!alternate) {
      delete $scope.formData[periodLetter].alternate.days[dayNumber - 1];
      $scope.formData[periodLetter].days[dayNumber - 1] = dayNumber;

    // Alternate day:
    // 1. Remove day number from primary days array
    // 2. Add day number to alternate days array
    } else {
      delete $scope.formData[periodLetter].days[dayNumber - 1];
      $scope.formData[periodLetter].alternate.days[dayNumber - 1] = dayNumber;
    }

  };

  $scope.$watch("formData.phoneNumber", function(phoneNumber){
    $scope.formData.phoneNumber = PhoneNumberFactory.parse(phoneNumber);
  });

  $scope.register = function (formData) {

    LoadingFactory.show();

    formData = RegistrationFactory.process(formData);

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
                'number or login using this phone number.',
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

        DataService.getUser(formData.phoneNumber).then(function (response) {

          if (!response.error) {
            StorageService.storeUser(response.data);
            LoadingFactory.hide();
            $state.go("schedule");
          } else {
            $ionicPopup.show({
              template: 'Something went wrong. Contact ' +
                        'info@getschedu.com if this keeps happening.',
              title: 'Sorry!',
              scope: $scope,
              buttons: [
                {text: 'Try again'}
              ]
            }).then(function () {
              LoadingFactory.hide();
              $state.go("register");
            })
          }
        });
      }

    });
  };

})

.controller('LoginCtrl', function($scope, $state, $ionicLoading, LoadingFactory, DataService, StorageService, PhoneNumberFactory, UsageFactory) {

  $scope.submittedInvalid = false;
  $scope.submittedValid = false;

  $scope.$watch("loginForm.phoneNumber", function(phoneNumber){
    $scope.loginForm.phoneNumber = PhoneNumberFactory.parse(phoneNumber);
  });

  $scope.login = function (phoneNumber, loginForm) {

    // Reset errors
    $scope.submittedInvalid = false;
    $scope.submittedValid = false;
    $scope.noUserFound = false;
    $scope.unknownError = false;

    LoadingFactory.show();

    if (loginForm.$valid) {

      $scope.submittedValid = true;

      // Get user data by phone number ID
      DataService.getUser(phoneNumber).then(function (response) {

        LoadingFactory.hide();

        // Successful retrieval of user data
        if (!response.error) {

          StorageService.storeUser(response.data);
          $state.go("schedule");

        // Show "not found" error message
        } else if (response.error.status == 404) {

          $scope.noUserFound = true;

        // Show offline error message
        } else if (!$scope.online) {

          $scope.noNetwork = true;

        // Show general error message
        } else {

          $scope.unknownError = true;
        }
      });

    } else {
      LoadingFactory.hide();
      $scope.submittedInvalid = true;
    }

  };

})

.controller('FeedbackCtrl', function($scope, $state, $ionicPopup, LoadingFactory, DataService, StorageService) {

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

  // Show informational popup if no votes
  if ($scope.feedback.voteItems.length == 0) {
    $ionicPopup.alert({
      title: 'SchedU needs your help!',
      template: "On this page, please select the features you would like to see in SchedU. " +
                 "The items with the most votes will be added to SchedU first!"
    });
  }

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
      $ionicPopup.alert({
        template: 'Sorry, you\'re out of votes! Try deselecting a feature.'
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
