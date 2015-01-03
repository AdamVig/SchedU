directives.directive('period', function ($compile) {
  return {
    restrict: 'E',
    templateUrl: 'html/_period.html',
    scope: {
      letter: "="
    },
    link: function (scope, elem, attrs) {
 
    }
  }
});
