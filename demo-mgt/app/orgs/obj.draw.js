'use strict';

(function(){
  var $ = require('zepto-browserify').$, AMap = require('AMap'), OID = require('bson-objectid');
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
  
  .service('drawTools', function($state, $rootScope, pouchDB){
    /* AMap Mousetool */
    var map = $rootScope.map,
    mapContainer = $('#container'),
    mouse = new AMap.MouseTool(map),
    /* mouse tool draw options */
    drawOpt = {strokeOpacity: 0.2, fillOpacity:0.3, clickable: true},
    service = this;
    
    /* draw state */
    this.drawing = {state: 0, objects:[], pop: {showing: 0}};

    /* draw done handlers */
    var markerInfoContent = '<div class="mappop"></div>',
    infoMarker = new AMap.InfoWindow({
      offset: new AMap.Pixel(0,0),
      closeWhenClickMap: true,
      content: markerInfoContent
    }), drawnListener = function(e) {
      console.log('drawn ' + e);

      /* update current drawing */
      service.drawing.current = e.obj;
      var type = e.obj.CLASS_NAME,
          newObj = {type: type},
          infoCoords, infoPop;

      /* save current drawing to cache */
      service.drawing.cache = {_id: OID().toString(), obj: newObj};
      switch(type){
        /* prepare current drawing cache data */
        case 'AMap.Circle':
          newObj.data = {
            center: [e.obj.getCenter().getLng(), e.obj.getCenter().getLat()], 
            radius: e.obj.getRadius()
          };
          infoCoords = e.obj.getCenter();
          /*TODO add pop */
          break;
        case 'AMap.Marker':
          newObj.data = {
            position: [e.obj.getPosition().getLng(), e.obj.getPosition().getLat()]
          };
          infoCoords = e.obj.getPosition();
          infoPop = infoMarker;
          break;
        default:
          newObj.data = {
            path: e.obj.getPath().map(function(path){return [path.getLng(), path.getLat()];})
          };
          infoCoords = e.obj.getPath()[0];
          /*TODO add pop */
          break;
      }
      /* save cache */
      pouchDB(['drawing', service.drawing.id].join('.'))
        .post(service.drawing.cache)
        .then(function(res){
          $.extend(service.drawing.cache, res);
          /* when drawing cached, popup for detailed info */
          infoPop.on('change', function(e){
            console.log('info window already opened...');
            /* move prepared pop elements to the amap popup */
            function replaceMapPop(service){
              if($('.mappop').length>0){
                $('.mappop').replaceWith($('#mappop'));
                service.drawing.pop.showing = 1;
                service.drawing.pop.dom = e.target;
                $('#mappop .list-block').removeClass('ng-hide');
              }else{
                /* replace the DOM ASAP */
                setTimeout(function(){replaceMapPop(service);}, 1);
              }
            }
            replaceMapPop(service);
          });

          /*TODO register close event for infoPop: 
           * when triggered, remove the pop and delete the marker
           */
          infoPop.open(map, infoCoords);
        });
    };

    this.drawListener = AMap.event.addListener(mouse, 'draw', drawnListener);

    var addListeners = function() {
      var drawDone = function(e) {
        console.log('key pressed ' + e);
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
          JSON.stringify($.extend(obj.data, drawOpt)) + ');');
        shape.setMap(map);
        /*TODO add click listener for shapes */
      });
      /* adjust map view */
      map.setFitView();
    };
    
    /* save the drawing cache to part */
    this.save = function(drawid, part){
      var drawingid = ['drawing', drawid].join('.');
      pouchDB(drawingid)
      .allDocs({include_docs: true})//, startkey: drawingid, endkey: drawingid+'\uffff'})
      .then(function(obj){
        if(!obj.rows.length){
          console.log('no drawing to save');
          return;
        }
        part.drawables = part.drawables.concat(obj.rows.map(function(row){return row.doc.obj;}));
        part.objects = part.drawables.length;
        pouchDB('part').put(part)
        .then(function(res){
          /*TODO post to server */
          console.log('res: ' + JSON.stringify(res));
          service.drawing.state = 0;
          mouse.close(true);
          service.show(part.drawables);
          pouchDB(drawingid).bulkDocs(obj.rows.map(function(row){
            row.doc._deleted = true;
            return row.doc;
          })).then(function(deletions){
            console.log('cache saved, now cleared ' + JSON.stringify(deletions));
          });
        }).catch(function(err){
          console.log('err: ' + err);
        });
      });
    };
    
    this.draw = function(drawid){
      service.drawing.state = 1;
      service.drawing.id = drawid;
    };
    
    this.clear = function(){
      mouse.close(true);
    };
    
    this.cancel = function(orgid, retain){
      /*TODO clear previously saved drawings for org */
      service.drawing.state = 0;
      mouse.close(retain);
    };

    /* draw tools */
    this.drawPoint = function() {
      addListeners();
      mouse.marker($.extend({
        animation: 'AMAP_ANIMATION_DROP',
        clickable: true,
        content: `
          <div class="map-marker">
            <svg width="100%" height="100%">
              <circle cx=".5rem" cy=".5rem" r=".2rem" fill="blue" stroke-width="3" stroke="grey"></circle>
            </svg>
          </div>
        `
      }, drawOpt));
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
