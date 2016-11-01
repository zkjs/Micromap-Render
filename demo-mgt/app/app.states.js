'use strict';
(function(){

  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .config(function($urlRouterProvider, $stateProvider, $locationProvider, $stickyStateProvider) {
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
      sticky: true,
      //dsr: true,
      views: {
        'part': {
          controller: 'c_partlist',
          templateUrl: '/views/panel/partlist.html'
        },
        'tools': {
          controller: 'c_draw',
          templateUrl: '/views/tools/draw.html'
        },
        'mappop': {
          controller: 'c_mappop',
          templateUrl: '/views/tools/mappop.html'
        }
      },
      params: {
        org: null
      }
    })
    .state('part.add', {
      url: '/add',
      views: {
        'modal':{
          controller: 'c_addpart',
          templateUrl: '/views/panel/addpart.html'
        } 
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
        },
        'mappop': {
          controller: 'c_mappop',
          templateUrl: '/views/tools/mappop.html'
        }
      },
      params: {
        part: null
      }
    });
    $stickyStateProvider.enableDebug(false);

  });

})();
