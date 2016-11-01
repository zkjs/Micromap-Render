'use strict';

(function(){
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_partlist', function($scope, $state, $stateParams, $rootScope, pouchDB, drawTools, $stickyState) {
    console.log('managing org: ' + JSON.stringify($stateParams));
    var org = $stateParams.org;

    $stickyState.reset('*');
    /* update rootScope data */
    $rootScope.navclick = function() {
      /* TODO prompt to save current objects if not saved */
      drawTools.clear();
      $scope.drawing.state = 0;
      $state.go('init', {}, {reload: true});
    };
    $rootScope.navbtn = '返回上级';
    $rootScope.title = org.title;
    
    var drawid = function(partid){
      return [$scope.org._id, partid].join('.');
    };

    /* preparing scope data */
    pouchDB('part')
    .allDocs({include_docs: true,
      /* even if we stored strings in the array, keys are parsed as numbers */
      keys:org.parts.map(function(part){return ''+part;})
    })
    .then(function(res){
      $scope.parts = res.rows.map(function(row){return row.doc;});
    })
    .catch(function(err){
      console.err('err fetching parts ' + err);
    });

    /* scope data and functions */

    $scope.org = org;
    $scope.drawing = drawTools.drawing;

    $scope.add = function(){
      console.log('add part for org ' + JSON.stringify($scope.org));
      $state.go('.add');
    };
    
    /**
     * show current part's objects on the map
     */
    $scope.show = function(partid, index){
      /* show current part's objects overview */
      pouchDB('part').get(partid)
      .then(function(part){
        part.index = index;
        $scope.part = part;
        drawTools.show(part.drawables, partid);
      });
      $scope.index = index;
    };
    
    /**
     * edit part objects
     * TODO navigate to objects view
     */
    $scope.edit = function(partid){
      var objectid = drawid(partid);
      console.log('editing ' + objectid);
      
      /* navigate to objlist */
      if(!!$scope.part){
        $state.go('obj', {
          part: $scope.part
        });
      }else{
        pouchDB('obj').get(partid)
        .then(function(part){
          $scope.part = part;
          $state.go('part', {
            part: part
          });
        });
      }
    };
    
    /**
     * show draw tools and start drawing objects
     */
    $scope.draw = function(part){
      if(!part){
        $.toast('开始绘制前, 请先选定对象');
        return;
      }
      /* start draw new objects for the part */
      var objectid = drawid(part._id);
      console.log('drawing ' + objectid);
      drawTools.draw(objectid);
    };
    
    /**
     * prompt for saving current drawings, filling in more details
     */
    $scope.saveDraw = function(part){
      console.log('about to save drawing ' + part._id);
      /*TODO prompt for more input to save drawings*/
      drawTools.save(drawid(part._id), $scope);
    };
    /**
     * cancel drawings
     */
    $scope.cancelDraw = function(part){
      console.log('drawing canceled ' + part._id);
      drawTools.cancel(part._id, true);
    };
    
    $scope.del = function(part, index){
      if(part.objects){
        var ocount = part.objects;
        /* clear part objects first */
        part.drawables = [];
        part.objects = 0;
        /* update the part */
        pouchDB('part').put(part)
        .then(function(res){
          console.log(['part', res.id, ocount, 'objects cleared'].join(' '));
        });
      }else{
        /* delete the part */
        if(part === $scope.parts.splice(index, 1)[0]){
          $scope.org.parts = $scope.parts.map(function(part){
            return part._id;
          });
          pouchDB('org').put($scope.org)
          .then(function(res){
            console.log('org ' + part._id + ' deleted');
          });
          $scope.part = null;
        }
      }
      drawTools.clear();
    };

    drawTools.resetView(org.position);
    
  });

})();
