directives.directive('period', [function () {
  return {
    restrict: 'E',
    templateUrl: 'html/_period.html'
  }
}])

.directive('edit-period', [function () {
  return {
    restrict: 'E',
    require: '^form',
    scope: {
      periodLetter: '@',
      currentClass: '=',
      currentClassForm: '='
    },
    templateUrl: 'html/_editperiod.html'
  }
}]);
