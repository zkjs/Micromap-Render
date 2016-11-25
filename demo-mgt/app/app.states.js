'use strict';
(function(){

  var AMap = require('AMap');
  require('angular').module('demo')

  .config(function($urlRouterProvider, $stateProvider, $locationProvider, $stickyStateProvider, $httpProvider) {
    $urlRouterProvider.when('', '/');
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);

    $stateProvider.state('init', {
      url: '/',
      views: {
        'panel': {
          controller: 'c_orglist',
          templateUrl: '/views/panel/orglist.html'
        },
        'tools': {
          controller: 'c_draw',
          templateUrl: '/views/tools/draw.html'
        },
        'mappop': {
          controller: 'c_mappop',
          templateUrl: '/views/tools/mappop.html'
        }
      }
    })
    .state('part', {
      url: '/part',
      sticky: true,
      views: {
        'part': {
          controller: 'c_partlist',
          templateUrl: '/views/panel/partlist.html'
        },
        'tools': {
          controller: 'c_snap',
          templateUrl: '/views/tools/snap.html'
        },
        'mappop': {
          controller: 'c_svgpop',
          templateUrl: '/views/tools/svgpop.html'
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

    $httpProvider.defaults.headers.post = {};

  });

  /* load taobao sm-ui */
  var sm = document.createElement('script');
  sm.type = 'text/javascript';
  sm.charset = 'utf-8';
  sm.src = 'assets/js/sm.min.js';
  document.getElementsByTagName('head')[0].appendChild(sm);

})();
