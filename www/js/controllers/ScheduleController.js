controllers.controller('ScheduleController', function($scope, $rootScope, $state, $q, LoadingFactory, DataService, DatabaseFactory, StorageService, ClassOrderFactory, DateFactory, UsageFactory) {

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

  // No local user, redirect to login page
  if (!localUser) {

    $state.go("login");
    LoadingFactory.hide();
    $scope.noUserFound = true;

  // Local user exists
  } else {

    ///////////////////
    // RETRIEVE USER //
    ///////////////////
    DatabaseFactory.user.get(localUser._id).then(function (response) {

      if (response.data._rev != localUser._rev) {

        localUser = response.data;
        StorageService.storeUser(localUser);
      }

    //////////////////////////
    // SYNC USER USAGE DATA //
    //////////////////////////

      localUser.usage = UsageFactory.get(localUser.usage);

      return DatabaseFactory.user.insert(localUser);

    }).catch(function (e) {

      if (e.status == 404) {

        $q.reject();
        $state.go("login");
        LoadingFactory.hide();
        $scope.noUserFound = true;
      }
    }).then(function (response) {

      localUser._rev = response.data.rev;
      StorageService.storeUser(localUser);

    });

    ///////////////////////
    // RETRIEVE SCHEDULE //
    ///////////////////////

    // Create and format date
    var date = DateFactory.currentDay();

    var dateString = date.format('MM-DD-YY');
    $scope.formattedDate = DateFactory.formatDate(date);

    // Get schedule, parse into A1 format, then make class order
    DatabaseFactory.schedule.get(dateString).then(function (response) {

      // Parse schedule object into A1 format
      $scope.scheduleString = ClassOrderFactory.makeScheduleString(response.data);

      // Make class order, hide loader
      $scope.classOrder = ClassOrderFactory.make(localUser, response.data);

      LoadingFactory.hide();

    }).catch(function (e) {
      if (!$scope.online) {

        LoadingFactory.quickHide();
        LoadingFactory.showNoConnection();

      } else {

        LoadingFactory.hide();
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
          $state.go("login");
        });
      }
    });
  }

});
