'use strict';

(function(){

  var AMap = require('AMap');
  require('angular').module('demo')

  /* localdata injection to initialize data */
  .run(function($rootScope, $state, localdata){
    $rootScope.$state = $state;
    //TODO authentication here
    //
    //
    var map = new AMap.Map('container', {
      mapStyle: 'normal',
      center: [104.203277,30.432479], //成都市双流区太平镇卫生院
      //center: [113.944053, 22.52872], //华中科大深圳产学研基地
      //center: [104.059855, 30.640753], //成都华西医院
      zoom: 19,
      zooms: [16, 20],
      resizeEnable: true,
      showIndoorMap: true,
      expandZoomRange: true,
      features: ['point', 'building', 'road']
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

    $rootScope.map = map;
    /* AMap Geocoder */
    $rootScope.geocoder = new AMap.Geocoder({
      radius: 10000,
      extensions: 'all'
    });

    /* load indoor map */
    AMap.plugin(['AMap.IndoorMap'], function(){
      var indoorMap = new AMap.IndoorMap({alwaysShow:true});
      $rootScope.map.setLayers([indoorMap, new AMap.TileLayer()]);
    });

  });

})();

