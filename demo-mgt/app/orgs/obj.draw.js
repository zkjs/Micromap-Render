'use strict';

(function(){
  var $ = require('zepto-browserify').$, AMap = require('AMap');
  require('angular').module('demo')

  .controller('c_draw', function($scope, $state, drawTools) {
    console.log('preparing drawing tools...');

    $scope.point = drawTools.drawPoint;
    $scope.circle = drawTools.drawCircle;
    $scope.polygon = drawTools.drawPolygon;
    $scope.rect = drawTools.drawRect;
    $scope.line = drawTools.drawLine;
    
    $scope.drawing = drawTools.drawing;
    
  })
  
  .service('drawTools', function($rootScope, pouchDB){
    /* AMap Mousetool */
    var map = $rootScope.map,
    mouse = new AMap.MouseTool(map),
    drawOpt = {strokeOpacity: 0.2, fillOpacity:0.3},
    mapContainer = $('#container'),
    service = this,
    drawing = {state: 0, objects:[]};
    
    /* draw state */
    
    this.drawing = drawing;

    /* draw finished handlers */
    
    var drawn = function(e) {
      console.log('drawn ' + e);
      /*TODO 
       * each time a graph is drawn, save the path to the db with org_part as id
       * handle errors
       */
      var type = e.obj.CLASS_NAME;
      var newObj = {type: type};
      switch(type){
        case 'AMap.Circle':
          newObj.data = {
            center: [e.obj.getCenter().getLng(), e.obj.getCenter().getLat()], 
            radius: e.obj.getRadius()
          };
          break;
        case 'AMap.Marker':
          newObj.data = {
            position: [e.obj.getPosition().getLng(), e.obj.getPosition().getLat()]
          };
          break;
        default:
          newObj.data = {
            path: e.obj.getPath().map(function(path){return [path.getLng(), path.getLat()];})
          };
          break;
      }
      var db = pouchDB('drawing');
      db.get(service.drawing.id)
      .then(function(obj){
        obj.list = obj.list || [];
        obj.list.unshift(newObj);
        db.put({
          _id: obj._id,
          list: obj.list,
          _rev: obj._rev
        });
      }).catch(function(error){
        console.log('no cache yet: ' + error);
        db.post({
          _id: service.drawing.id,
          list: [newObj]
        }).then(function(res){
          console.log('cached drawing ' + res._id);
        });
      });
    };
    this.drawListener = AMap.event.addListener(mouse, 'draw', drawn);

    var addListeners = function() {
      var drawDone = function(e) {
        console.log('key pressed ' + JSON.stringify(drawOpt));
        /* add key bindings: finish{ enter(13) }*/
        if (e.which === 13 ){
          mouse.close(false);
          e.preventDefault();
          /* when triggered, remove the listener */
          mapContainer.off('keypress', drawDone);
        }
      };
      mapContainer.on('keypress', drawDone);
    };
    
    /**
     * simply draw all objects in the part
     */
    this.show = function(objs){
      /* clear previous drawings */
      service.clear();
      if(!objs || objs.length<1){
        console.log('nothing to show');
        return;
      }
      objs.forEach(function(obj){
        var shape = eval('new ' + obj.type + '(' + /* jshint ignore:line */
          JSON.stringify($.extend(drawOpt, obj.data)) + ');');
        shape.setMap(map);
        /* caching all drawings in cache for cleaning tasks */
        drawing.objects.unshift(shape);
      });
      /* adjust map view */
      map.setFitView();
    };
    
    this.save = function(drawid, part){
      pouchDB('drawing').get(drawid)
      .then(function(obj){
        part.drawables = obj.list;
        pouchDB('part').put(part)
        .then(function(res){
          /*TODO post to server */
        });
        drawing.state = 0;
        mouse.close(false);
      });
    };
    
    this.draw = function(drawid){
      drawing.state = 1;
      drawing.id = drawid;
    };
    
    this.clear = function(){
      mouse.close(true);
      if(!!drawing.objects){
        drawing.objects.forEach(function(obj){obj.setMap(); obj=null;});
        drawing.objects = [];
      }
    };
    
    this.cancel = function(orgid, retain){
      /*TODO clear previously saved drawings for org */
      drawing.state = 0;
      mouse.close(retain);
    };

    /* draw tools */
    this.drawPoint = function() {
      addListeners();
      mouse.marker(drawOpt);
    };
    this.drawCircle = function() {
      addListeners();
      mouse.circle(drawOpt);
    };
    this.drawPolygon = function() {
      addListeners();
      mouse.polygon(drawOpt);
    };
    this.drawLine = function() {
      addListeners();
      mouse.polyline(drawOpt);
    };
    this.drawRect = function() {
      addListeners();
      mouse.rectangle(drawOpt);
    };
    
  });

})();
