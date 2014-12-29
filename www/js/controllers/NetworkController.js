controllers.controller('NetworkCtrl', function ($scope, $state, $timeout, LoadingFactory) {

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
});
