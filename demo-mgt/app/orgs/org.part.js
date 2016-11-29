'use strict';

(function(){
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_partlist', function($scope, $state, $stateParams, $rootScope, pouchDB, drawTools, snapTools, $stickyState, $http, CONST) {
    var org = $stateParams.org;
    console.log('managing org: ' + org._id);

    /* show org drawables as backgrounds */
    org.drawables.forEach(function(orgdraw) {
      orgdraw.retain = 1;
    });
    drawTools.show(org.drawables, org._id);

    $stickyState.reset('*');
    /* update rootScope data */
    $rootScope.navclick = function() {
      /* TODO prompt to save current objects if not saved */
      drawTools.clear(true);
      $scope.drawing.state = 0;
      drawTools.show();
      $state.go('init', {}, {reload: true});
    };
    $rootScope.navbtn = '返回上级';
    $rootScope.title = org.title;
    
    var drawid = function(partid){
      return [$scope.org._id, partid].join('.');
    };

    /* preparing scope data */
    pouchDB('part')
    .allDocs({include_docs: true, startkey:org._id, endkey: org._id+'.\uffff'})
    .then(function(res){
      if(res.rows.length===0){
        throw new Error('no data in cache!');
      }else{
        $scope.parts = res.rows.map(function(row){return row.doc;});
      }
    })
    .catch(function(err){
      console.error('err fetching parts ' + err);
      /* when no cache found, init data via remote fetching */
      $http({ method: 'GET',url: CONST.URL_PARTLIST.replace(':orgid', org._id)})
      .then(function successCallback(resp) {
        console.log('parse parts ' + JSON.stringify(resp));
        if( 
            resp.status === 200 && 
            resp.data.status === 'ok'
        ){
          pouchDB('part').bulkDocs(
            resp.data.data.map(function(part){
              part._id = org._id.concat('.', part._id);
              part.objects = part.drawables.length;
              return part;
            })
          ).then(function(res){
            console.log('data loaded from remote server: ' + resp.data.data.length);
            $scope.parts = resp.data.data;
            org.parts = $scope.parts.map(function(part){return part._id;});
          }).catch(function(perr){
            console.error('failed to cache org parts ' + perr);
          });
        }
      }, function errorCallback(errResp){
        console.error('failed to fetch basic data ' + JSON.stringify(errResp));
      });
      /* */

    });
    /* scope data and functions */

    $scope.org = org;
    $scope.drawing = drawTools.drawing;

    $scope.add = function(){
      console.log('add part for org ' + org._id);
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
        drawTools.clear();
        drawTools.show(part.drawables, partid);
      });
      $scope.index = index;
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
      drawTools.save(drawid(part._id), $scope, 'part');
    };
    /**
     * cancel drawings
     */
    $scope.cancelDraw = function(part){
      console.log('drawing canceled ' + part._id);
      drawTools.cancel(drawid(part._id), true);
    };

    /**
     * edit part objects
     * TODO navigate to objects view
     */
    $scope.edit = function(part, index){
      var objectid = drawid(part._id);
      console.log('editing ' + objectid);
      $scope.part = part;
      $scope.index = index;
      drawTools.clear();
      drawTools.show(part.drawables, part._id, true);
      drawTools.draw(drawid(part._id));
      
      /* navigate to objlist */
      //if(!!$scope.part){
      //  $state.go('obj', {
      //    part: $scope.part
      //  });
      //}else{
      //  pouchDB('obj').get(partid)
      //  .then(function(part){
      //    $scope.part = part;
      //    $state.go('part', {
      //      part: part
      //    });
      //  });
      //}
    };
    
    $scope.del = function(part, index){
      if(part.objects){
        var ocount = part.objects;
        /* clear part objects first */
        part.drawables = [];
        part.objects = 0;
        /* update the part */
        /*TODO empty the drawables in the part from server */
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

          /*TODO delete the the part from server */
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
