'use strict';

(function(){
  require('angular').module('demo')

  .controller('c_partlist', function($scope, $state, $stateParams, $window, $rootScope, pouchDB, drawTools) {
    console.log('managing org: ' + JSON.stringify($stateParams));
    var org = $stateParams.org;

    /* update rootScope data */
    $rootScope.navclick = function() {
      /* TODO prompt to save current objects if not saved */
      drawTools.clear();
      if ($window.history.length <= 2) {
        $state.go('init');
      }else {
        $window.history.back();
      }
    };
    $rootScope.navbtn = '返回上级';
    $rootScope.title = org.title;
    
    var drawid = function(partid){
      return [$scope.org._id, partid].join('.');
    };

    /* preparing scope data */
    pouchDB('part').allDocs({include_docs: true,
      /* even if we stored strings in the array, keys are parsed as numbers */
      keys:org.parts.map(function(part){return ''+part;})
    }).then(function(res){
      $scope.parts = res.rows.map(function(row){return row.doc;});
    });

    $scope.org = org;
    $scope.drawing = drawTools.drawing;
    
    /* scope functions */
    
    /**
     * show current part's objects on the map
     */
    $scope.show = function(partid){
      /* show current part's objects overview */
      pouchDB('part').get(partid)
      .then(function(part){
        $scope.part = part;
        drawTools.show(part.drawables);
      });
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
    $scope.draw = function(partid){
      /* start draw new objects for the part */
      var objectid = drawid(partid);
      console.log('drawing ' + objectid);
      drawTools.draw(objectid);
    };
    
    /**
     * prompt for saving current drawings, filling in more details
     */
    $scope.saveDrawPromt = function(partid){
      console.log('about to save drawing ' + partid);
      /*TODO prompt for more input to save drawings*/
      drawTools.save(drawid(partid), $scope.part);
    };
    /**
     * cancel drawings
     */
    $scope.cancelDraw = function(partid){
      console.log('drawing canceled ' + partid);
      drawTools.cancel(partid, true);
    };
    
    /**
     * save part's new drawings to part's objects
     */
    $scope.saveDraw = function(partid){
      /* TODO save path to local db and push to server when possible */
      console.log('posting drawings to server '+ partid);
    };

    $scope.del = function(part, index){
      /*TODO delete all drawings in the part 
       * if it has objects, clear objects first, update the part
       * else delete the part and update org
       */
      if(part.objects){
        /* clear part objects */
        part.drawables = [];
        part.objects = 0;
        /* update the part */
        pouchDB('part').put(part)
        .then(function(res){
          console.log('part ' + res.id + ' objects cleared');
        });
      }else{
        if(part === $scope.parts.splice(index, 1)[0]){
          $scope.org.parts = $scope.parts;
          pouchDB('org').put($scope.org)
          .then(function(res){
            console.log('org ' + part._id + ' deleted');
            part = null;
          });
        }
      }
      
      
    };
    
  });
})();
