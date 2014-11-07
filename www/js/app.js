angular.module('schedu', ['ionic', 'schedu.services', 'schedu.controllers', 'schedu.constants', 'schedu.filters'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $stateProvider

    .state('schedule', {
      url: '/schedule',
      templateUrl: 'templates/schedule.html',
      controller: 'ScheduleCtrl'
    })

    .state('feedback', {
      url: '/feedback',
      templateUrl: 'templates/feedback.html',
      controller: 'FeedbackCtrl'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html'
    })

    .state('register-new', {
      url: '/register-new',
      templateUrl: 'templates/register-new.html',
      controller: 'RegisterCtrl'
    });

  $urlRouterProvider.otherwise('/schedule');

})

.run(function($window, $rootScope) {

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

