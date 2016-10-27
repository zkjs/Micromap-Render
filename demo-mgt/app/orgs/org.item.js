'use strict';

angular.module('demo')

.controller('c_org', function($scope, $state, $stateParams, $window, $rootScope) {
  console.log('managing org: ' + JSON.stringify($stateParams));

  /* update rootScope data */
  $rootScope.navclick = function() {
    if ($window.history.length <= 2) $state.go('init');
    else $window.history.back();
  };
  $rootScope.navbtn = '返回上级';
  $rootScope.title = $stateParams.org.title;

  /* object list */
  $scope.floors = $stateParams.org.floors;
  $scope.parts = [];

  /*TODO centering current object */
})
