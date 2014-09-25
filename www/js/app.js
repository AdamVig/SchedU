angular.module('schedu', ['ionic', 'schedu.services', 'schedu.controllers'])

.constant("dbUrl", "https://schedu.cloudant.com/")

.config(function($stateProvider, $urlRouterProvider, dbUrl) {

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

