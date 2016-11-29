'use strict';

(function(){

  var $ = require('zepto-browserify').$, 
      Snap = require('Snap'),
      OID = require('bson-objectid');
  require('angular').module('demo')

  .controller('c_snap', function($scope, $state, snapTools) {
    console.log('preparing snapping tools...');

    $scope.showAP = snapTools.showAP;
    $scope.hideAP = snapTools.hideAP;
    $scope.point = snapTools.drawPoint;
    $scope.save = snapTools.save;
    $scope.cancel = snapTools.cancel;
    $scope.drawing = snapTools.drawing;
  })

  .service('snapTools', function($state, $rootScope, pouchDB, $timeout, $http, CONST){
    var paper = null, service = this;

    /* draw state */
    this.drawing = {
      state: 0, /* drawing tools state: 0 - showing, 1 - ready to draw, 2 - drawing */
      showing: 0, 
      ratio: 1.0, vratio: 1.0, bounds: {}, /* coords */
      aps: [], /* current showing ap list, used to control visibility toggling */
      events: {}, /* keep track of all binded events while drawing */
      pop: {},  /* pop up properties */
      cache: { data: {}, saved: false, shape: [] } /* drawing caches */
    };
    this.coords = null;
    this.draw = function(drawid) {
      service.drawing.showing = 0;
      service.drawing.state = 1;
    };

    /*drawing caches*
     * given screen coords, translate to viewBox coords
     * TODO handle short and narrow screen 
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
      console.log(x + ',' + y);
      var vCoords = viewBoxCoords(x, y), paper = service.paper;
      if(vCoords.inside){
        service.clearUnsaved();
        var center = paper.circle(vCoords.vx, vCoords.vy, 10);
        center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
        //TODO rotate according to the distance to the wall
        var dropin = paper.circle(vCoords.vx, vCoords.vy, CONST.BLE_RANGE);
        dropin.attr({fill: 'rgba(56,72,224,.3)', strokeWidth: 1, stroke: '#333'});
        service.drawing.cache.shape.unshift(dropin);
        service.drawing.cache.shape.unshift(center);
        /* drop popup here: fill ap id and save position for the ap */
        var drawable = {
          _id: OID().toString(),
          obj: { type: 'AMap.Marker', data: { position: [vCoords.vx, vCoords.vy]} }
        };
        pouchDB(service.drawing.id)
        .post(drawable)
        .then(function(res) {
          console.log('cached ' + res.id);
          service.drawing.cache.id = res.id; 
          service.drawing.cache.rev = res.rev;
          service.showPop(x, y, vCoords.vx, vCoords.vy);
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
        part = scope[elename],
        cache = service.drawing.cache;

      endDrawing();

      pouchDB('ap').allDocs({keys: Object.keys(cache.data), include_docs: true})
      .then(function(res){
        console.log('updating local ap detail ');
        /* merge marker detail */
        var updatedAPs = res.rows.map(function(row) {
          return row.doc;
        });
        updatedAPs.forEach(function(ap) {
          $.extend(ap, cache.data[ap._id]);
          ap.status = 1;
        });
        return pouchDB('ap').bulkDocs(updatedAPs);
      })
      .then(function(res){
        console.log('ap cache detail merged');
        service.drawing.state = 0;
        service.show();
        service.showAP();
      })
      .catch(function(err){
        console.error('merging marker details ' + err);
      });

      //TODO update remote models
      //$http.put(
      //  CONST.URL_APLIST, cache.data
      //).then(function successCallback(resp) {
      //  console.log('parse orgs ' + JSON.stringify(resp));
      //  if( 
      //      resp.status === 200 && 
      //      resp.data.status === 'ok'
      //  ){
      //   pouchDB('ap').allDocs({keys: cache.data.map(function(ap){return ap.id;})})
      //   .then(function(res){
      //     console.log('updating local ap detail ');
      //     /* merge marker detail */
      //     var updatedAPs = res.rows.map(function(row) {
      //       return row.doc;
      //     });
      //     updatedAPs.forEach(function(ap) {
      //       $.extend(ap, cache.data[ap._id]);
      //       ap.status = 1;
      //     });
      //     return pouchDB('ap').put(updatedAPs);
      //   })
      //   .then(function(res){
      //     console.log('ap cache detail merged');
      //     ctrl.clearModel();
      //     snapTools.clearUnsaved();
      //     snapTools.showAP();
      //   })
      //   .catch(function(err){
      //     //TODO roll back local change if remote update failed
      //     console.error('merging marker details ' + err);
      //   });
      //  }
      //}, function errorCallback(errResp){
      //  console.error('failed to fetch basic data ' + JSON.stringify(errResp));
      //});
    };

    this.cancel = function() {
      endDrawing();
      service.show();
      service.showAP();
    };

    /* clear current drawings and cache */
    this.clear = function() {
      if(!!service.paper){
        /* destroy zpd to ensure re-initialization */
        service.paper.zpd('destroy');
        service.paper.clear();
      }
      service.clearUnsaved();
      service.clearCache();
      service.drawing.state = 0;
      service.drawing.aps = [];
    };

    this.clearCache = function() {
      if(!!service.drawing.id){
        pouchDB(service.drawing.id).destroy().then(function(resp){
          console.log('drawing cache cleared');
        });
      }
    };

    this.clearUnsaved = function() {
      var cache = service.drawing.cache;
      cache.data = {};
      cache.saved = true;
      cache.shape.forEach(function(s) {
        if(!s.saved){
          s.remove();
        }
      });
      service.closePop();
    };

    this.hide = function() {
      service.clear();
    };

    this.showPop = function(x, y, vx, vy) {
      var pop = service.drawing.pop;
      $('body').append('<div id="popwrapper" style="position:absolute;width:5.5rem;z-index:1000;left:'+x+'px;top:'+y+'px;"></div>');
      $('#popwrapper').append($('#mappop'));
      pop.showing = 1;
      pop.vx = vx;
      pop.vy = vy;
    };

    this.closePop = function() {
      $('body').append($('#mappop'));
      service.drawing.pop.showing = 0;
      $('#popwrapper').remove();
    };

    /**
     * calculate the center of the path
     */
    function pathCenter(path) {
      var x=0, y=0;
      for(var i=0; i<path.length; i++){
        x += path[i][0];
        y += path[i][1];
      }
      return {x: x/path.length, y: y/path.length, width: Math.abs(path[1][0]-path[0][0]), height: Math.abs(path[1][1]-path[2][1])};
    }

    /* show indoor map */
    this.show = function(objs, partid, scope, elename) {
      if(!!service.paper){
        service.drawing.zpd = service.paper.zpd('save');
      }
      service.clear();
      service.drawing.showing = 1;
      service.drawing.partid = partid || service.drawing.partid;
      service.drawing.scope = scope || service.drawing.scope;
      service.drawing.elename = elename || service.drawing.elename;
      service.drawing.objs = objs || service.drawing.objs;
      service.drawing.aps = [];
      service.drawing.floor = service.drawing.scope[service.drawing.elename].floor;
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
          default: /* polygon by default */
            /* svg path */
            var path = obj.data.path.map(function(p) {
              return p.join(',');
            }).join('L');
            paper.path('M'+path+'Z');
            var textPos = pathCenter(obj.data.path), wordWidth = textPos.width/10;
            paper.text(textPos.x-obj.title.length*wordWidth/2, textPos.y, obj.title).attr({strokeWidth: 1, fontSize: wordWidth, fill: '#333'});
            break;
        }
      });

      service.paper = paper;

    };

    /* only enable panning/zooming/draggin on trigger */
    $rootScope.$on('zpd', function(){
      if(!service.drawing.zpd){
        service.paper.zpd();
      }else{
        service.paper.zpd({load: service.drawing.zpd});
      }
    });

    /* show ap points */
    this.showAP = function() {
      if(!!service.drawing.aps && !!service.drawing.aps.length){
        service.drawing.aps.forEach(function(ap) {
          ap.attr({visibility: 'visible'});
        });
        return;
      }
      /* get current floor, based on the floor, get ap's at current floor */
      var floor = service.drawing.floor, paper = service.paper;
      paper.attr({visibility: 'hidden'});
      pouchDB('ap')
      .allDocs({include_docs: true})
      .then(function(res) {
        res.rows.filter(function(row) {
          return row.doc.status===1 && row.doc.floor===floor;
        }).forEach(function(row) {
          var obj = row.doc;
          var center = paper.circle(obj.longitude, obj.latitude, 10);
          center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
          var dropin = paper.circle(obj.longitude, obj.latitude, CONST.BLE_RANGE);
          dropin.attr({fill: 'rgba(112,114,250,.1)', strokeWidth: 1, stroke: '#333'});
          service.drawing.aps.unshift(center);
          service.drawing.aps.unshift(dropin);
        });
        paper.attr({visibility: 'visible'});
        $rootScope.$emit('zpd');
      });
    };

    this.hideAP = function() {
      service.drawing.aps.forEach(function(ap) {
        ap.attr({visibility: 'hidden'});
      });
    };

  });

})();

