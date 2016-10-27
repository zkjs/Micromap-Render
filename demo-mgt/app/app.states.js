'use strict';

angular.module('demo')

.config(function($urlRouterProvider, $stateProvider, $locationProvider) {
  $urlRouterProvider.when('', '/');
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);

  $stateProvider
    .state('init', {
      url: '/',
      views: {
        'panel': {
          controller: 'c_orglist',
          templateUrl: '/views/panel/orglist.html'
        }
      }
    })
    .state('org', {
      url: '/org',
      views: {
        'panel': {
          controller: 'c_org',
          templateUrl: '/views/panel/org.html'
        },
        'tools': {
          controller: 'c_draw',
          templateUrl: '/views/tools/draw.html'
        }
      },
      params: {
        org: null
      }
    });
});
