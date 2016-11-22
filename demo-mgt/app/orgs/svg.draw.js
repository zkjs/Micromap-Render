'use strict';

(function(){

  var $ = require('zepto-browserify').$, 
      Snap = require('Snap'),
      OID = require('bson-objectid');
  require('angular').module('demo')

  .controller('c_snap', function($scope, $state, snapTools) {
    console.log('preparing snapping tools...');

    $scope.point = snapTools.drawPoint;
    $scope.drawing = snapTools.drawing;
  })

  .service('snapTools', function($state, $rootScope, pouchDB, $timeout, $http, CONST){

    var paper = null, service = this;

    /* draw state */
    this.drawing = {state: 0, objects:[], ratio: 1.0, vratio: 1.0};

    this.draw = function(objectid) {
      service.drawing.state = 1;
    };

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

    this.drawPoint = function() {
      var paper = service.paper;
      paper.zpd('destroy');
      paper.attr({viewBox:'0 0 5040 1220'});

      service.coords = null;
      paper.mousemove(function(e, x, y) {
        var vCoords = viewBoxCoords(x,y);
        if(vCoords.inside){
          service.coords = service.coords || service.paper.text(0, 0, '[0, 0]');
          service.coords.attr({x: vCoords.vx, y: vCoords.vy, strokeWidth: 1, fontSize: vCoords.fsize, fill: '#333'});
          service.coords.node.textContent = '['+ vCoords.vx +',' + vCoords.vy +']';
        }
      });

      paper.click(function(e, x, y) {
        //drop a ap listener on the map on click
        //TODO draw a point on (x,y)
        var vCoords = viewBoxCoords(x, y), paper = service.paper;
        if(vCoords.inside){
          var center = paper.circle(vCoords.vx, vCoords.vy, 50/vCoords.ratio);
          center.attr({fill: 'rgb(56,72,224)', strokeWidth: 2, stroke: 'rgb(56,72,224)'});
          var dropin = paper.circle(vCoords.vx, vCoords.vy, CONST.BLE_RANGE/vCoords.ratio);
          dropin.attr({fill: 'rgba(56,72,224,.3)', strokeWidth: 1, stroke: '#333'});
          //TODO drop popup here
        }
        
        //TODO rotate according to the distance to the wall
        //TODO cache the point
      });
    };

    this.show = function(objs, bounds) {
      bounds = {width:5040, height:1220};
      var objLow = [], objHigh = [];
      for(var i = 0; i<9; i++){
        objLow.unshift({x: i*360, y: 0, width: 360, height: 488, title: '病房'});
        objHigh.unshift({x: i*360, y: 732, width: 360, height: 488, title: '病房'});
      }
      objLow.unshift({x: 9*360, y: 0, width: 360*4, height: 1220, title: '产房'});
      objLow.unshift({x: 13*360, y:0, width: 360, height: 488, title: '杂物间'});
      objHigh.unshift({x: 13*360, y:732, width: 360, height: 488, title: '楼梯'});
      var paper = new Snap('#indoor');
      paper.attr({
        fill: '#eee',
        stroke: '#333',
        strokeWidth: 5
      });
      
      objLow.forEach(function(obj) {
        paper.rect(obj.x, obj.y, obj.width, obj.height);
        var text = paper.text(obj.x+obj.width/3, obj.y+obj.height/2, obj.title);
        text.attr({strokeWidth: 1, fontSize: obj.width/6, fill: '#333'});
      });

      objHigh.forEach(function(obj) {
        paper.rect(obj.x, obj.y, obj.width, obj.height);
        var text = paper.text(obj.x+obj.width/3, obj.y+obj.height/2, obj.title);
        text.attr({strokeWidth: 1, fontSize: obj.width/6, fill: '#333'});
      });

      paper.zpd();

      service.paper = paper;

      //var bigCircle = s.circle(150, 150, 100);
      // // By default its black, lets change its attributes
    };

  });

})();

