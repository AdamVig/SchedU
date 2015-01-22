controllers.controller('EditController', ['$scope', 'StorageService', 'DataService', function ($scope, StorageService, DataService) {

  var edit = this;
  var localUser = StorageService.getUser();

  $scope.formData = {
    "a": localUser.a,
    "b": localUser.b,
    "c": localUser.c,
    "d": localUser.d,
    "e": localUser.e,
    "f": localUser.f,
    "g": localUser.g
  };

  edit.saveChanges = function () {

    return;
  };

}]);
