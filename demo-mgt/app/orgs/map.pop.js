'use strict';

(function(){
  
  require('angular').module('demo')

  .controller('c_mappop', function($scope, $state, $stateParams, $rootScope, pouchDB, drawTools) {
    console.log('map pop init.');
    $scope.test = 'hello world!';
    $scope.testClick = function(){
      console.log('clicked ' + $scope.title);
    };
    $scope.showinfo = drawTools.showinfo;

    $scope.save = function(drawid){
      /*TODO save current model to the drawid 
       * update the objects
       */
    };

  });
  
})();
