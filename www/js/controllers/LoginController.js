controllers.controller('LoginController', function($scope, $state, $ionicLoading, LoadingFactory, DataService, DatabaseFactory, StorageService, PhoneNumberFactory, UsageFactory) {

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
      DatabaseFactory.user.get(phoneNumber).then(function (response) {

        LoadingFactory.hide();
        StorageService.storeUser(response.data);
        $state.go("schedule");

      }).catch(function (e) {

        if (e.status == 404) {

          $scope.noUserFound = true;
        } else if (!$scope.online) {

          $scope.noNetwork = true;
        } else {

          $scope.unknownError = true;
        }
        LoadingFactory.hide();
      });

    } else {
      LoadingFactory.hide();
      $scope.submittedInvalid = true;
    }
  };
});
