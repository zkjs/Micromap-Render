'use strict';

(function(){
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_addpart', function($scope, $state, $rootScope, $timeout, pouchDB){
    console.log('adding part...');

    $timeout(function(){
      $('.ui-modal').addClass('modal-in');
    }, 100);
    var fresh = {title: null, floor: null, objects: 0, drawables:[], id: null, gps:{}};
    $scope.fresh = fresh;

    $scope.savePart = function(){
      console.log('saving new part '  + JSON.stringify(fresh));
      pouchDB('part').post(fresh).then(function(res){
        console.log(res.id + ' new part saved');
        fresh.id = res.id;
        $scope.org.parts.unshift(fresh.id);
        $scope.org.floors = ($scope.org.floors || 0) + 1;
        return pouchDB('org').put($scope.org);
      })
      .then(function(org){
        console.log('org added a new part ' + org.id);
        $scope.org._rev = org.rev;
        /* TODO post to server for the new part */
        $state.go('part', {org: $scope.org}, {reload: true});
      })
      .catch(function(err){
        console.err('error updating org list ' + err);
      });

    };

    $scope.backtoPart = function(){
      console.log('back to part list');
      $state.go('part');
    };

  });

})();
