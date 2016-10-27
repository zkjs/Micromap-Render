'use strict';

angular.module('demo')

.run(function($rootScope, $window, $state, $location) {
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
    map.indoorMap.showIndoorMap('B0FFGDWGIT', 5);
  });

  /* AMap Mousetool */
  $rootScope.mousetool = new AMap.MouseTool(map);

  /* AMap Geocoder */
  $rootScope.geocoder = new AMap.Geocoder({
    radius: 10000,
    extensions: 'all'
  });

  $rootScope.map = map;

});
