controllers.controller('ScheduleCtrl', function($scope, $rootScope, $state, $q, LoadingFactory, DataService, StorageService, ClassOrderFactory, DateFactory, UsageFactory, SyncUserFactory) {

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

});
