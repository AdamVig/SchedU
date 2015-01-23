directives.directive('period', [function () {
  return {
    restrict: 'E',
    templateUrl: 'html/_period.html'
  }
}])

.directive('editPeriod', [function () {
  return {
    restrict: 'E',
    require: '^form',
    scope: {
      periodLetter: '=',
      currentClass: '='
    },
    templateUrl: 'html/_editperiod.html'
  }
}]);
