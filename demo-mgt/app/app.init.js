'use strict';

(function(){

  var $ = require('zepto-browserify').$, AMap = require('AMap'), Draggable = require('Draggable');
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
      zooms: [18, 20],
      dragEnable: true,
      zoomEnable: true,
      rotateEnable: true,
      scrollWheel: true,
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
      $('.amap-toolbar').append('<div class="amap-spinner"><div class="slice"</div></div>');
      Draggable.create('.amap-spinner', {
        type: 'rotation',
        onDrag: function() {
          var angle = $('.amap-spinner')[0]._gsTransform.rotation;
          if (angle < 0) {
            angle = 360+angle%360;
          } else if (angle > 360) {
            angle %= 360;
          } 
          $rootScope.map.setRotation(angle);
        }
      });
    });

  });

})();

