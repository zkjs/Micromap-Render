'use strict';

(function(){

  var $ = require('zepto-browserify').$, 
      Snap = require('Snap'),
      OID = require('bson-objectid');
  require('angular').module('demo')

  .controller('c_snap', function($scope, $state, snapTools) {
    console.log('preparing snapping tools...');

    $scope.point = snapTools.drawPoint;
    $scope.save = snapTools.save;
    $scope.cancel = snapTools.cancel;
    $scope.drawing = snapTools.drawing;
  })

  .service('snapTools', function($state, $rootScope, pouchDB, $timeout, $http, CONST){
    var paper = null, service = this;

    /* draw state */
    this.drawing = {state: 0, objects:[], ratio: 1.0, vratio: 1.0, bounds: {}, events: {}, pop: {}, cache: {data: []}};
    this.coords = null;
    this.draw = function(drawid) {
      service.drawing.state = 1;
    };

    /**
     * given screen coords, translate to viewBox coords
     */
    function viewBoxCoords(x, y){
      var viewPortWidth = service.paper.node.width.baseVal.value, viewPortHeight = service.paper.node.height.baseVal.value,
        viewBox = service.paper.attr('viewBox');
      if(viewPortWidth<viewBox.width){
        service.drawing.ratio = viewBox.width / viewPortWidth;
      }
      if(viewPortHeight<viewBox.height){
        service.drawing.vratio = viewBox.height / viewPortHeight;
      }
      var ratio = service.drawing.ratio, vratio = service.drawing.vratio;
      var vy = y*ratio-(viewPortHeight- viewBox.height/ratio)*2, vx = x*ratio;
      return {
        ratio: ratio, vx: Math.round(vx), vy: Math.round(vy), fsize: viewPortWidth/20,
        inside: vy>=0&&vy<=viewBox.height && vx>=0&&vx<=viewBox.width
      };
    }
    
    function addAP(e, x, y) {
      //TODO clear unsaved
      console.log(x + ',' + y);
      var vCoords = viewBoxCoords(x, y), paper = service.paper;
      if(vCoords.inside){
        service.clearUnsaved();
        var center = paper.circle(vCoords.vx, vCoords.vy, 10);
        center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
        //TODO rotate according to the distance to the wall
        var dropin = paper.circle(vCoords.vx, vCoords.vy, CONST.BLE_RANGE);
        dropin.attr({fill: 'rgba(56,72,224,.3)', strokeWidth: 1, stroke: '#333'});
        service.drawing.cache.data.unshift(dropin);
        service.drawing.cache.data.unshift(center);
        //TODO drop popup here: fill ap id and save position for the ap
        var drawable = {
          _id: OID().toString(),
          obj: { type: 'AMap.Marker', data: { position: [vCoords.vx, vCoords.vy]} }
        };
        //TODO cache the point
        pouchDB(service.drawing.id)
        .post(drawable)
        .then(function(res) {
          console.log('cached ' + res.id);
          service.drawing.cache.id = res.id; 
          service.drawing.cache.rev = res.rev;
          service.showPop(x, y);
          //TODO open info pop for AP info
        });
      }
    }

    function traceMouse(e, x, y) {
      var vCoords = viewBoxCoords(x,y);
      if(vCoords.inside){
        service.coords = service.coords || service.paper.text(0, 0, '[0, 0]');
        service.coords.attr({x: vCoords.vx, y: vCoords.vy, strokeWidth: 1, fontSize: vCoords.fsize, fill: '#333'});
        service.coords.node.textContent = '['+ vCoords.vx +',' + vCoords.vy +']';
      }
    }

    function startDrawing() {
      /* fit and fix the view */
      var paper = service.paper;
      /* show save/cancel buttons */
      service.drawing.state = 2;
      $('#left').hide();
      service.drawing.zpd = paper.zpd('save');
      paper.zpd('destroy');
      /* trace mouse movements as a coord reference */
      paper.mousemove(traceMouse);
      service.drawing.events.mousemove = traceMouse;
    }

    function endDrawing() {
      /* hide save/cancel buttons */
      service.drawing.state = 1;
      $('#left').show();

      var paper = service.paper;
      /* stop tracing mouse movements */
      if(!!service.coords) {
        service.coords.remove();
      }
      service.coords = null;
      /* unregister all event listeners */
      Object.keys(service.drawing.events).forEach(function(eventName) {
        paper['un'+eventName](service.drawing.events[eventName]);
      });
      paper.node.removeAttribute('viewBox');
    }

    /**
     * draw a AP on the map, fit the view by providing real width and height for viewBox
     */
    this.drawPoint = function() {
      var paper = service.paper, bounds = service.drawing.bounds;
      startDrawing();
      /* view fitting */
      paper.attr({viewBox:'0 0 ' + bounds.width + ' ' + bounds.height});

      paper.click(addAP);
      service.drawing.events.click = addAP;
    };

    this.save = function() {
    //TODO save drawings in caches to db and post to server
      var elename = service.drawing.elename, 
        scope = service.drawing.scope,
        part = scope[elename];

      endDrawing();
      pouchDB(service.drawing.id).allDocs({include_docs: true})
      .then(function(obj) {
        if(!!obj.rows.length){
            /* concat new drawings */
            part.drawables = part.drawables.concat(obj.rows.map(function(row){return row.doc.obj;}));
          }
          part.objects = part.drawables.length;
          scope[elename+'s'][part.index] = part;
          delete part.index;

          /* TODO remove for production */
          pouchDB(elename).put(part)
          .then(function(res){
            if(!!res) {
              console.log(elename + ' updated : ' + JSON.stringify(res));
              part._rev = res.rev;
            }
            service.drawing.state = 0;
            service.clear();
            service.show(part.drawables, part._id, scope, elename);
          })
          .catch(function(err){
            console.error('err: ' + err);
          });

          /* for production */
          var partid = part._id.split('.')[1];
          //TODO update ap positions in remote server
      });
    };

    this.cancel = function() {
      //TODO cancel drawings
      service.clear();
      endDrawing();
      service.show();
    };

    this.clear = function() {
      //TODO clear current drawings and cache
      if(!!service.paper){
        /* destroy zpd to ensure re-initialization */
        service.paper.zpd('destroy');
        service.paper.clear();
      }
      service.clearUnsaved();
      service.clearCache();
      service.drawing.state = 0;
    };

    this.clearCache = function() {
      if(!!service.drawing.id){
        pouchDB(service.drawing.id).destroy().then(function(resp){
          console.log('drawing cache cleared');
        });
      }
    };

    this.clearUnsaved = function(retain) {
      var cache = service.drawing.cache;
      if(retain) {
        cache.data = [];
      }else{
        cache.data.forEach(function(c) {
          c.remove();
        });
      }
      if(!!cache.id){
        pouchDB(service.drawing.id)
        .remove({_id: cache.id, _rev: cache.rev})
        .then(function(deletion){
          console.log('previous unsaved drawing cleared ' + JSON.stringify(deletion));
        })
        .catch(function(err){
          console.log('clear unsaved err ' + err);
        });
      }
      service.closePop();
    };

    this.hide = function() {
      service.clear();
    };

    this.showPop = function(x, y) {
      $('body').append('<div id="popwrapper" style="position:absolute;width:5.5rem;z-index:1000;left:'+x+'px;top:'+y+'px;"></div>');
      //TODO create a popup dom and save to drawing
      //append mappop dom here
      $('#popwrapper').append($('#mappop'));
      service.drawing.pop.showing = 1;
    };

    this.closePop = function() {
      //TODO move mappop to root dom
      //remove the popup dom
      $('body').append($('#mappop'));
      service.drawing.pop.showing = 0;
      $('#popwrapper').remove();
    };

    function pathCenter(path) {
      var x=0, y=0;
      for(var i=0; i<path.length; i++){
        x += path[i][0];
        y += path[i][1];
      }
      return {x: x/path.length, y: y/path.length, width: Math.abs(path[1][0]-path[0][0]), height: Math.abs(path[1][1]-path[2][1])};
    }

    this.show = function(objs, partid, scope, elename) {
      service.clear();
      service.drawing.partid = partid || service.drawing.partid;
      service.drawing.scope = scope || service.drawing.scope;
      service.drawing.elename = elename || service.drawing.elename;
      service.drawing.objs = objs || service.drawing.objs;
      objs = service.drawing.objs;
      service.drawing.bounds = {width:5040, height:1220};
      service.drawing.id = 'drawing.'+service.drawing.partid;
      
      var paper = new Snap('#indoor');
      paper.attr({
        fill: '#eee',
        stroke: '#333',
        strokeWidth: 5
      });
      
      /* view fitting */
      service.drawing.objs.forEach(function(obj){
        switch(obj.type){
          case 'AMap.Marker':
            //TODO add to markerToggles
            var center = paper.circle(obj.data.position[0], obj.data.position[1], 10);
            center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
            //TODO rotate according to the distance to the wall
            var dropin = paper.circle(obj.data.position[0], obj.data.position[1], CONST.BLE_RANGE);
            dropin.attr({fill: 'rgba(112,114,250,.1)', strokeWidth: 1, stroke: '#333'});
            break; 
          default:
            var path = obj.data.path.map(function(p) {
              return p.join(',');
            }).join('L');
            paper.path('M'+path+'Z');
            var textPos = pathCenter(obj.data.path), wordWidth = textPos.width/10;
            paper.text(textPos.x-obj.title.length*wordWidth/2, textPos.y, obj.title).attr({strokeWidth: 1, fontSize: wordWidth, fill: '#333'});
            break;
        }
      });

      if(!service.drawing.zpd){
        paper.zpd();
      }else{
        paper.zpd({load: service.drawing.zpd});
      }

      service.paper = paper;

    };

  });

})();

