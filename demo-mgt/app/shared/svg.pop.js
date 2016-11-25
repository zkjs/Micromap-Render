'use strict';

(function(){
  
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_svgpop', function($scope, $state, $stateParams, $rootScope, pouchDB, snapTools) {
    console.log('svg pop init.');
    var drawobj = $scope.drawobj = snapTools.drawing, ctrl = this;
    $scope.pop = drawobj.pop;
    $scope.model = {};

    this.clearModel = function(){
      $scope.model = {};
    };

    /* update details for ap */
    $scope.saveDrawing = function(){
      var model = $scope.model;
      console.log('saving ap detail ' + JSON.stringify(model));
      /* updating details into cache */
      pouchDB(drawobj.id).get(drawobj.cache.id)
      .then(function(marker){
        console.log('updating cache drawing ' + JSON.stringify(model));
        /* merge marker detail */
        $.extend(marker.obj, model);
        return pouchDB(drawobj.id).put(marker);
      })
      .then(function(res){
        console.log('ap cache detail merged ' + res.id);
        drawobj.cache.id = null;
        drawobj.cache.rev = null;
        ctrl.clearModel();
        snapTools.clearUnsaved(true);
      })
      .catch(function(err){
        console.error('merging marker details ' + err);
      });
    };

    $scope.clearUnsaved = function(){
      console.log('clearing ap detail');
      snapTools.clearUnsaved();
      ctrl.clearModel();
    };

  });
  
})();
