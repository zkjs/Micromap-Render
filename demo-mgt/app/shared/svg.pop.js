'use strict';

(function(){
  
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_svgpop', function($scope, $state, $stateParams, $rootScope, pouchDB, snapTools) {
    console.log('svg pop init.');
    var drawobj = $scope.drawobj = snapTools.drawing, ctrl = this;
    $scope.aps = [];
    $scope.pop = drawobj.pop;
    $scope.model = {};

    /* load unused aps from local */
    pouchDB('ap').allDocs({include_docs: true})
    .then(function(res) {
      $scope.aps = $scope.aps.concat(res.rows.filter(function(row) {
        return row.doc.status === 0;
      }).map(function(row) {
        row.doc.id = row.doc._id;
        return row.doc;
      }));
    });

    this.clearModel = function(){
      $scope.model = {};
    };

    /* update details for ap */
    $scope.saveDrawing = function(){
      var model = $scope.model, pop = $scope.drawobj.pop, cache = $scope.drawobj.cache, aps = $scope.aps;
      model.floor = $scope.drawobj.floor;
      model.longitude = pop.vx;
      model.latitude = pop.vy;
      console.log('saving ap detail ' + JSON.stringify(model));

      cache.saved = false;
      cache.data[model.id] = model;
      for(var i = 0; i<aps.length; i++){
        if(aps[i].id===model.id){
          aps.splice(i, 1);
          break;
        }
      }
      cache.shape.forEach(function(s) {
        s.saved = true;
      });
      //TODO remove the ap from aps
      snapTools.closePop();
      ctrl.clearModel();
    };

    $scope.clearUnsaved = function(){
      console.log('clearing ap detail');
      snapTools.clearUnsaved();
      ctrl.clearModel();
    };

  });
  
})();
