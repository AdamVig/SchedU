angular.module('schedu', ['ionic', 'schedu.services', 'schedu.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('schedule', {
      url: '/schedule',
      templateUrl: 'templates/schedule-index.html',
      controller: 'ScheduleCtrl'
    })

    .state('start', {
      url: '/',
      templateUrl: 'templates/start.html'
    })

    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })

    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    });

  $urlRouterProvider.otherwise('/schedule');

});

