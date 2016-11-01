'use strict';

(function(){
  
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_mappop', function($scope, $state, $stateParams, $rootScope, pouchDB, drawTools) {
    console.log('map pop init.');
    var drawobj = $scope.drawobj = drawTools.drawing,
        styles = drawTools.styles, ctrl = this;
    $scope.pop = drawobj.pop;

    this.clearModel = function(){
      $scope.mtitle = null;
      $scope.mtype = '';
    };


    /* update marker info for drawing object */
    $scope.saveDrawing = function(){
      var mdetail = {title: $scope.mtitle, markertype: $scope.mtype},
          mdom = '<div class="map-marker-text">' + mdetail.title +'</div>',
          dbname = ['drawing', drawobj.id].join('.');
      console.log('saving drawing detail ' + JSON.stringify(mdetail));
      /* updating details into cache */
      pouchDB(dbname).get(drawobj.cache.id)
      .then(function(marker){
        console.log('updating cache drawing ' + JSON.stringify(marker));
        /* merge marker detail */
        $.extend(marker.obj.data, styles.marker);
        marker.obj.data.content += mdom;
        $.extend(marker.obj, mdetail);
        return pouchDB(dbname).put(marker);
      })
      .then(function(res){
        console.log('marker cache detail merged ' + res.id);
        ctrl.clearModel();
        /* close current info window */ 
        drawobj.pop.dom.close();
        /* show preview */
        var currentObj = drawobj.current;
        if(!!currentObj.getContent){
          currentObj.setContent(currentObj.getContent() + mdom);
        }
        currentObj.cacheSaved = true;
      })
      .catch(function(err){
        console.error('merging marker details ' + err);
      });
    };

    $scope.clearUnsaved = function(){
      /* TODO 
       * and clear the model */
      if(!!drawobj.current){
        /* clear current marker from the view */
        drawobj.pop.dom.close();
        drawobj.current.setMap();
        pouchDB(['drawing', drawobj.id].join('.'))
        .remove({_id: drawobj.cache.id, _rev: drawobj.cache.rev})
        .then(function(deletion){
          console.log('unsaved drawing cleared ' + JSON.stringify(deletion));
        })
        .catch(function(err){
          console.log('clear unsaved err ' + err);
        });
      }
      console.log('clearing marker');
    };

  });
  
})();
