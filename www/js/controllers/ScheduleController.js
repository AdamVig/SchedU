controllers.controller('ScheduleController', function($state, $q, $ionicPopup, LoadingFactory, DataService, DatabaseFactory, StorageService, ClassOrderFactory, DateFactory, UsageFactory) {

  var schedule = this;
  LoadingFactory.show();
  schedule.testingNetwork = false;
  schedule.dateShow = false;

  schedule.logout = function () {
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
    schedule.noUserFound = true;

  // Local user exists
  } else {

    DatabaseFactory.user.get(localUser._id).then(function (response) {

      if (response.data._rev != localUser._rev) {

        localUser = response.data;
        StorageService.storeUser(localUser);
      }

      localUser.usage = UsageFactory.get(localUser.usage);

      return DatabaseFactory.user.insert(localUser);

    }).catch(function (e) {

      if (e.status == 404) {

        $q.reject();
        $state.go("login");
        LoadingFactory.hide();
        schedule.noUserFound = true;
      }
    }).then(function (response) {

      localUser._rev = response.data.rev;
      StorageService.storeUser(localUser);

    });

    var date = DateFactory.currentDay();
    var dateString = date.format('MM-DD-YY');
    schedule.formattedDate = DateFactory.formatDate(date);

    // Get schedule, parse into A1 format, then make class order
    DatabaseFactory.schedule.get(dateString).then(function (response) {

      // Parse schedule object into A1 format
      schedule.scheduleString = ClassOrderFactory.makeScheduleString(response.data);

      // Make class order, hide loader
      schedule.classOrder = ClassOrderFactory.make(localUser, response.data);

      LoadingFactory.hide();

    }).catch(function (e) {
      if (!schedule.online) {

        LoadingFactory.quickHide();
        LoadingFactory.showNoConnection();

      } else {

        LoadingFactory.hide();
        $ionicPopup.show({
          template: 'Something went wrong. Contact ' +
          'info@getschedu.com if this keeps happening.',
          title: 'Sorry!',
          scope: schedule,
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
