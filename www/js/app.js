var schedu = angular.module('schedu', ['ionic', 'schedu.services', 'schedu.controllers', 'schedu.constants', 'schedu.filters', 'schedu.directives']);
var controllers = angular.module('schedu.controllers', []);
var services = angular.module('schedu.services', []);
var constants = angular.module('schedu.constants', []);
var filters = angular.module('schedu.filters', []);
var directives = angular.module('schedu.directives', []);

schedu.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider

    .state('schedule', {
      url: '/schedule',
      templateUrl: 'html/schedule.html',
      controller: 'ScheduleController as schedule'
    })

    .state('feedback', {
      url: '/feedback',
      templateUrl: 'html/feedback.html',
      controller: 'FeedbackController as feedback'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'html/login.html'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'html/register.html'
    })

    .state('edit', {
      url: '/edit',
      templateUrl: 'html/edit.html',
      controller: 'EditController as edit'
    });

  $urlRouterProvider.otherwise('/schedule');

});

schedu.run(function($window, $rootScope) {

  /**
   * Check if device has internet connection
   * Directly sets $rootScope.online variable
   * because img.* functions are asynchronous
   */
  $rootScope.checkOnLine = function () {

    var online;
    var img = new Image();

    img.onload = function () {
      $rootScope.online = true;
    };

    img.onerror = function () {
      $rootScope.online = false;
    };
    img.src = "http://google.com/favicon.ico?" + Math.round(Math.random() * 100000);

  };

  $rootScope.checkOnLine();

});
