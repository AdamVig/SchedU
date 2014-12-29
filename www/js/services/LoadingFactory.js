services.factory('LoadingFactory', function ($ionicLoading) {
  return {
    show: function () {
      $ionicLoading.show({
        templateUrl: 'html/_loader.html',
        noBackdrop: false
      });
    },
    showNoConnection: function () {
      $ionicLoading.show({
        templateUrl: 'html/_noconnection.html',
        noBackdrop: false
      });
    },
    quickHide: function () {
      $ionicLoading.hide();
    },
    hide: function () {
      setTimeout(function(){
        $ionicLoading.hide();
      }, 200);
    }
  }
});
