angular.module('schedu.filters', [])
 
.directive('period', function ($compile) {
  return {
    restrict: 'E',
    templateUrl: 'templates/period.html',
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
})

.filter('sentencecase', function () {
  
  return function (sentence) {
    var sentenceWords = sentence.split(" ");
    var capitalizedSentence = "";
    
    _.each(sentenceWords, function (word, wordNum) {

      capitalizedSentence += word.substring(0,1).toUpperCase();
      capitalizedSentence += word.slice(1);

      // Add space if not last word in sentence
      if (wordNum + 1 < sentenceWords.length) {
        capitalizedSentence += " ";
      }
    });

    return capitalizedSentence;
  };
})

.filter('range', function() {
  return function(input, start, end) {
    start = parseInt(start);
    end = parseInt(end);
    for (var i=start; i<=end; i++)
      input.push(i);
    return input;
  };
})

.filter('phonenumber', function () {
      
  return function (number) {
    /* 
    @param {Number | String} number - Number that will be formatted as telephone number
    Returns formatted number: (###) ###-####
      if number.length < 4: ###
      else if number.length < 7: (###) ###
    */
    if (!number) return '';

    var formattedNumber = number;

    // # (###) ###-#### as c (area) front-end
    var area = number.substring(0,3);
    var front = number.substring(3, 6);
    var end = number.substring(6, 10);

    if (front) {
      formattedNumber = area + "-" + front;  
    }
    if (end) {
      formattedNumber += "-" + end;
    }

    return formattedNumber;
  };
});
