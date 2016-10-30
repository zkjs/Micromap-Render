'use strict';

(function(){
  
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_mappop', function($scope, $state, $stateParams, $rootScope, pouchDB, drawTools) {
    console.log('map pop init.');
    $scope.drawobj = drawTools.drawing;

    $scope.saveMarker = function(){

      var mdetail = {title: $scope.mtitle, type: $scope.mtype},
          drawobj = $scope.drawobj;
      console.log('saving marker detail ' + JSON.stringify(mdetail));
      /*TODO  after updating detailed info into cache,
      /* close current info window */ 
      drawobj.pop.dom.close();
      /* show a preview */
      var currentObj = drawobj.current;
      /*TODO save current marker details to the drawid  + drawobj.cache._id */
      currentObj.setContent( currentObj.getContent() + '<div class="map-marker-text">' + mdetail.title +'</div>' );
    };

    $scope.clearMarker = function(){
      /* TODO clear current marker from the view 
       * and clear the model */
      console.log('clearing marker');
    };

  });
  
})();
