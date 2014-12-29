directives.directive('period', function ($compile) {
  return {
    restrict: 'E',
    templateUrl: 'html/_period.html',
    scope: {
      letter: "="
    },
    link: function (scope, elem, attrs) {

      // Replace %% character with current period letter
      elem.html(elem[0].innerHTML.replace("ltr", scope.letter));

      // Compile template
      $compile(elem.contents())(scope);
    }
  }
});
