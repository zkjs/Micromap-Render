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
    this.drawing = {state: 0, objects:[], ratio: 1.0, vratio: 1.0, bounds: {}, events: {}};
    this.coords = null;

    this.draw = function(drawid) {
      service.drawing.state = 1;
      service.drawing.id = drawid;
    };

    function drawingid() {
      return 'drawing.'+service.drawing.id;
    }

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
      var vCoords = viewBoxCoords(x, y), paper = service.paper;
      if(vCoords.inside){
        var center = paper.circle(vCoords.vx, vCoords.vy, 10);
        center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
        //TODO rotate according to the distance to the wall
        var dropin = paper.circle(vCoords.vx, vCoords.vy, CONST.BLE_RANGE);
        dropin.attr({fill: 'rgba(56,72,224,.3)', strokeWidth: 1, stroke: '#333'});
        //TODO drop popup here: fill ap id and save position for the ap
        var drawable = {
          _id: OID().toString(),
          obj: { type: 'AMap.Marker', data: { position: [vCoords.vx, vCoords.vy]} }
        };
        //TODO cache the point
        pouchDB(drawingid())
        .post(drawable)
        .then(function(res) {
          console.log('cached ' + res.id);
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
      service.coords.remove();
      service.coords = null;
      /* unregister all event listeners */
      Object.keys(service.drawing.events).forEach(function(eventName) {
        paper['un'+eventName](service.drawing.events[eventName]);
      });
      paper.node.removeAttribute('viewBox');
      paper.zpd({load: service.drawing.zpd});
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
      endDrawing();
      //sav
      var elename = service.drawing.elename, 
        scope = service.drawing.scope,
        part = scope[elename];
      pouchDB(drawingid()).allDocs({include_docs: true})
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
      });
    };

    this.cancel = function() {
      //TODO cancel drawings
      endDrawing();
      service.clear();
    };

    this.clear = function() {
      //TODO clear current drawings and cache
      if(!!service.paper){
        /* destroy zpd to ensure re-initialization */
        service.paper.zpd('destroy');
        service.paper.clear();
      }
      service.clearCache();
    };

    this.clearCache = function() {
      pouchDB(drawingid()).destroy().then(function(resp){
        console.log('drawing cache cleared');
      });
    };

    this.hide = function() {
      service.clear();
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
      service.drawing.partid = partid;
      service.drawing.scope = scope;
      service.drawing.elename = elename;

      var bounds = {width:5040, height:1220};
      service.drawing.bounds = bounds;
      
      var paper = new Snap('#indoor');
      paper.attr({
        fill: '#eee',
        stroke: '#333',
        strokeWidth: 5
      });
      
      //var objLow = [], objHigh = [];
      //for(var i = 0; i<9; i++){
      //  objLow.unshift({x: i*360, y: 0, width: 360, height: 488, title: '病房'});
      //  objHigh.unshift({x: i*360, y: 732, width: 360, height: 488, title: '病房'});
      //}
      //objLow.unshift({x: 9*360, y: 0, width: 360*4, height: 1220, title: '产房'});
      //objLow.unshift({x: 13*360, y:0, width: 360, height: 488, title: '杂物间'});
      //objHigh.unshift({x: 13*360, y:732, width: 360, height: 488, title: '楼梯'});
      //objLow.forEach(function(obj) {
      //  paper.rect(obj.x, obj.y, obj.width, obj.height);
      //  var text = paper.text(obj.x+obj.width/3, obj.y+obj.height/2, obj.title);
      //  text.attr({strokeWidth: 1, fontSize: obj.width/6, fill: '#333'});
      //});

      //objHigh.forEach(function(obj) {
      //  paper.rect(obj.x, obj.y, obj.width, obj.height);
      //  var text = paper.text(obj.x+obj.width/3, obj.y+obj.height/2, obj.title);
      //  text.attr({strokeWidth: 1, fontSize: obj.width/6, fill: '#333'});
      //});

      /* view fitting */
      objs.forEach(function(obj){
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

      paper.zpd();

      service.paper = paper;

    };

  });

})();

