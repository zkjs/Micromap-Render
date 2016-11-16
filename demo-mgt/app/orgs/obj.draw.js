'use strict';

(function(){

  var $ = require('zepto-browserify').$, 
      AMap = require('AMap'), 
      OID = require('bson-objectid');

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
  
  .service('drawTools', function($state, $rootScope, pouchDB, $timeout, $http, CONST){
    /* AMap Mousetool */
    var map = $rootScope.map,
    mapContainer = $('#container'),
    mouse = new AMap.MouseTool(map),
    /* mouse tool draw options */
    drawOpt = {strokeOpacity: 0.2, fillOpacity:0.3, clickable: true},
    service = this,
    /* current shoing shapes on the map */
    showingObjs = [];
    
    /* draw state */
    this.drawing = {state: 0, objects:[], pop: {showing: 0}};

    this.styles = {
      marker: {
        animation: 'AMAP_ANIMATION_NONE',
        clickable: true,
        content: `
          <div class="map-marker">
            <svg width="100%" height="100%">
              <circle cx=".5rem" cy=".5rem" r=".2rem" fill="blue" stroke-width="3" stroke="grey"></circle>
            </svg>
          </div>
        `
      }
    };



    /**
     * replace map's popup with custom information window then start drawing
     */
    function replaceMapPop(){
      console.log('map pop replacing...');
      if($('.mappop').length>0){
        console.log('now replacing...');
        $('.mappop').append($('#mappop'));
        service.drawing.pop.showing = 1;
      }else{
        /* replace the DOM: first time loading might take some time */
        $timeout(function(){replaceMapPop();}, 30);
      }
    }

    /* custom information window */
    var markerInfoContent = '<div class="mappop"></div>',
    infoPop = new AMap.InfoWindow({
      offset: new AMap.Pixel(0,0),
      closeWhenClickMap: true,
      content: markerInfoContent
    });

    /**
     * listener for object drawing done event 
     * when a shape is drawn, it'll be cached
     */
    var drawnListener = function(e) {
      console.log('drawn ' + e);

      var type = e.obj.CLASS_NAME,
          newObj = {type: type},
          current = service.drawing.current,
          dbname = ['drawing', service.drawing.id].join('.'),
          infoCoords;

      if( !!current && // previously drawn
          !!service.drawing.cache && // already cached
          !current.cacheSaved // not saved yet
        ){
        /* clear previous cache if not saved */
        current.setMap();
        pouchDB(dbname)
        .remove({_id: service.drawing.cache.id, _rev: service.drawing.cache.rev})
        .then(function(deletion){
          console.log('previous unsaved drawing cleared ' + JSON.stringify(deletion));
        })
        .catch(function(err){
          console.log('clear unsaved err ' + err);
        });
      }

      /* update current drawing */
      service.drawing.current = e.obj;

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
          break;
        case 'AMap.Marker':
          newObj.data = {
            position: [e.obj.getPosition().getLng(), e.obj.getPosition().getLat()]
          };
          infoCoords = e.obj.getPosition();
          break;
        default:
          newObj.data = {
            path: e.obj.getPath().map(function(path){return [path.getLng(), path.getLat()];})
          };
          infoCoords = e.obj.getBounds().getCenter();
          break;
      }
      $.extend(newObj, {longitude: infoCoords.getLng(), latitude: infoCoords.getLat()});
      /* save cache */
      pouchDB(dbname)
      .post(service.drawing.cache)
      .then(function(res){
        $.extend(service.drawing.cache, res);
        /* when drawing cached, popup for detailed info */
        infoPop.on('open', function(e){
          console.log('info window already opened...');
          service.drawing.pop.dom = e.target;
          /* move prepared pop elements to the amap popup */
          replaceMapPop();
        });
        /*TODO register close event for infoPop: 
         * when triggered, remove the pop and delete the marker
         */
        infoPop.open(map, infoCoords);
      });
    };

    this.drawListener = AMap.event.addListener(mouse, 'draw', drawnListener);

    /* key pressing listeners: might be removed in the future */
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
      mapContainer.on('keMaypress', drawDone);
    };

    /**
     * shape clicking event handlers 
     * - double click: start editing
     * - right click: finish editing and save in updating-cache
     */
    var shapeDoubleClick = function(e) {
      console.log('double clicked ');
      e.target.editor = new AMap.PolyEditor(e.target.getMap(), e.target);
      e.target.editor.open();
    },
    shapeRightClick = function(e) {
      console.log('right clicked ');
      if(!!e.target.editor){
        e.target.editor.close();
        //TODO save the updated obj in cache
        delete e.target.editor;
      }
    };

    
    /**
     * simply draw all objects in the part
     */
    this.show = function(objs, partid, editing){
      if(partid === service.drawing.partid && !editing){
        return;
      }
      service.clear();
      service.drawing.partid = partid;
      /* clear previous drawings */
      if(!objs || objs.length<1){
        console.log('nothing to show');
        return;
      }
      objs.forEach(function(obj){
        var shape = eval('new ' + obj.type + '(' + /* jshint ignore:line */
          JSON.stringify($.extend(obj.data, drawOpt)) + ');');
        shape.setMap(map);

        /* only show editors in editing mode */
        if(!!editing){
          shape.on('dblclick', shapeDoubleClick);
          shape.on('rightclick', shapeRightClick);
        }

        /* add current showing objects to release list for later clearance */
        showingObjs.unshift(shape);
        /*TODO add click listener for shapes */
      });
    };
    
    /* save the drawing cache to part */
    this.save = function(drawid, scope, elename){
      var drawingid = ['drawing', drawid].join('.'), part = scope[elename];
      //TODO update for the updated caches
      pouchDB(drawingid).allDocs({include_docs: true})
      .then(function(obj){
        if(!obj.rows.length){
          console.log('no drawing to save');
          return;
        }
        part.drawables = part.drawables.concat(obj.rows.map(function(row){return row.doc.obj;}));
        part.objects = part.drawables.length;
        scope[elename+'s'][part.index] = part;
        delete part.index;
        var partid = part._id.split('.')[1];

        /* TODO remove for production */
        pouchDB(elename).put(part)
        .then(function(res){
          if(!!res) {
            console.log(elename + ' updated : ' + JSON.stringify(res));
            part._rev = res.rev;
          }
          service.drawing.state = 0;
          service.show(part.drawables);
        })
        .catch(function(err){
          console.error('err: ' + err);
        });

        //$http.post(
        //  CONST.URL_SAVEDRAWING.replace(':partid',partid),
        //  {'part': partid, 'drawing': part.drawables}
        //).then(function successCallback(resp) {
        //  console.log('parse orgs ' + JSON.stringify(resp));
        //  if( 
        //      resp.status === 200 && 
        //      resp.data.status === 'ok'
        //  ){
        //    pouchDB('part').put(part)
        //    .then(function(res){
        //      if(!!res) {
        //        console.log('part updated : ' + JSON.stringify(res));
        //        part._rev = res.rev;
        //      }
        //      service.drawing.state = 0;
        //      service.show(part.drawables);
        //    })
        //    .catch(function(err){
        //      console.error('err: ' + err);
        //    });
        //  }
        //}, function errorCallback(errResp){
        //  console.error('failed to fetch basic data ' + JSON.stringify(errResp));
        //});
      });
    };
    
    this.draw = function(drawid){
      service.drawing.state = 1;
      service.drawing.id = drawid;
    };

    this.resetView = function(position){
      if(!!position){
        map.setCenter(position);
      }
    };

    /** 
     * clear drawing caches:
     * - destroy drawing cache db
     * - close/hide drawing pop
     * - close AMap.mouse
     * - destroy updating cache db
     */
    function clearCache(retainMouse){
      var drawing = service.drawing;
      if(!!drawing.cache){
        var drawingid = ['drawing', drawing.id].join('.');
        pouchDB(drawingid).destroy().then(function(resp){
          console.log('cache cleared');
          drawing.cache = null;
        });
      }
      if(!!drawing.pop.dom && drawing.pop.dom.getIsOpen()){
        drawing.pop.dom.close();
      }
      showingObjs.forEach(function(s) {
        /* only show editors in editing mode */
        s.off('dblclick', shapeDoubleClick);
        s.off('rightclick', shapeRightClick);
      });
      //TODO destroy updating cache
      drawing.pop.showing = 0;
      drawing.state = 0;
      mouse.close(!!retainMouse);
    }
   
    this.clear = function(){
      showingObjs.forEach(function(s){
        if(!!s.getMap()){
          s.setMap();
          s = null;
        }
      });
      showingObjs = [];
      service.drawing.partid = null;
      clearCache(true);
    };
    
    
    this.cancel = function(drawid){
      service.drawing.state = 0;
      if(!!service.drawing.pop.dom) {
        service.drawing.pop.dom.close();
      }
      clearCache(true);
    };

    /* draw tools */
    this.drawPoint = function() {
      addListeners();
      var markerOptions = $.extend({}, service.styles.marker, drawOpt, {animation: 'AMAP_ANIMATION_DROP'});
      mouse.marker(markerOptions);
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
