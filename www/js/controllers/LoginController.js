controllers.controller('LoginCtrl', function($scope, $state, $ionicLoading, LoadingFactory, DataService, StorageService, PhoneNumberFactory, UsageFactory) {

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

});
