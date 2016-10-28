'use strict';
(function(){
  require('angular').module('demo')

  .config(function($urlRouterProvider, $stateProvider, $locationProvider) {
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider.state('init', {
      url: '/',
      views: {
        'panel': {
          controller: 'c_orglist',
      templateUrl: '/views/panel/orglist.html'
        }
      }
    })
    .state('part', {
      url: '/part',
      views: {
        'panel': {
          controller: 'c_partlist',
          templateUrl: '/views/panel/partlist.html'
        },
        'tools': {
          controller: 'c_draw',
          templateUrl: '/views/tools/draw.html'
        }
      },
      params: {
        org: null
      }
    })
    .state('obj', {
      url: '/part/obj',
      views: {
        'panel': {
          controller: 'c_objlist',
          templateUrl: '/views/panel/objlist.html'
        },
        'tools': {
          controller: 'c_draw',
          templateUrl: '/views/tools/draw.html'
        }
      },
      params: {
        part: null
      }
    });
  });
})();
