'use strict';

(function(){

  var AMap = require('AMap');
  require('angular').module('demo')

  /* localdata injection to initialize data */
  .run(function($rootScope, $state, $http, $location, localdata, pouchDB) {
    $rootScope.$state = $state;
    var map = new AMap.Map('container', {
      // center: [113.944053, 22.52872], //华中科大深圳产学研基地
      center: [104.059855, 30.640753], //成都华西医院
      zoom: 18,
      zooms: [12, 18],
      resizeEnable: true,
    });

    /* AMap Toolbar */
    map.addControl(new AMap.ToolBar({
      position: 'RT',
      locate: false
    }));

    /* AMap Scaling */
    map.addControl(new AMap.Scale({
      position: 'LB'
    }));

    /* AMap IndoorMap */
    map.on('indoor_create', function() {
      map.indoorMap.showIndoorMap('B0FFGDWGIT', 1);
    });

    /* AMap Geocoder */
    $rootScope.geocoder = new AMap.Geocoder({
      radius: 10000,
      extensions: 'all'
    });

    $rootScope.map = map;

    /** TODO init data via remote fetching 
    $http({
      method: 'GET',
      url: 'http://'+$location.host()+(!!$location.port()?':'+$location.port():'')+'/map/org'
    }).then(function successCallback(resp) {
      console.log('parse orgs ' + JSON.stringify(resp));
      // TODO save to local db
    }, function errorCallback(errResp){
      console.err('failed to fetch basic data ' + JSON.stringify(errResp));
    });
    */

  });

})();

