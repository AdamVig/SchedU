controllers.controller('LoginController', function($scope, $state, $ionicLoading, LoadingFactory, DataService, DatabaseFactory, StorageService, PhoneNumberFactory, UsageFactory) {

  var login = this;
  login.submittedInvalid = false;
  login.submittedValid = false;

  $scope.$watch(angular.bind(login, function () {
    return login.loginForm.phoneNumber;
  }), function(phoneNumber){
    login.loginForm.phoneNumber = PhoneNumberFactory.parse(phoneNumber);
  });

  login.loginUser = function (phoneNumber, loginForm) {

    // Reset errors
    login.submittedInvalid = false;
    login.submittedValid = false;
    login.noUserFound = false;
    login.unknownError = false;

    LoadingFactory.show();

    if (loginForm.$valid) {

      login.submittedValid = true;

      // Get user data by phone number ID
      DatabaseFactory.user.get(phoneNumber).then(function (response) {

        LoadingFactory.hide();
        StorageService.storeUser(response.data);
        $state.go("schedule");

      }).catch(function (e) {

        if (e.status == 404) {

          login.noUserFound = true;
        } else if (!login.online) {

          login.noNetwork = true;
        } else {

          login.unknownError = true;
        }
        LoadingFactory.hide();
      });

    } else {
      LoadingFactory.hide();
      login.submittedInvalid = true;
    }
  };
});
