'use strict';

(function(){
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_orglist', function($scope, $state, $rootScope, pouchDB, $stickyState, $http, CONST) {
    console.log('init finished!');
    /* clear previous sticket states,  if any */
    $stickyState.reset('*');
    /* update rootScope variables */
    $rootScope.title = 'XX单位地图对象';
    $rootScope.navbtn = '新增对象';
    $rootScope.navclick = function() {
      console.log('adding new org');
    };
    $http({ method: 'GET', url: CONST.URL_ORGLIST })
    .then(function successCallback(resp) {
      console.log('parse orgs ' + JSON.stringify(resp));
      if( 
          resp.status === 200 && 
          resp.data.status === 'ok'
      ){
        pouchDB('org').destroy().then(function(res){
          $scope.orgs = resp.data.data.map(function(org){
            org.parts = [];
            return org;
          });
          pouchDB('org').bulkDocs($scope.orgs).then(function(res){
            console.log('data loaded from remote server: ' + resp.data.data.length);
          });
        });
      }
    }, function errorCallback(errResp){
      console.error('failed to fetch basic data ' + JSON.stringify(errResp));
    });

    /* org item onclick: go to item's object list */
    $scope.manage = function(org) {
      $state.go('part', {
        org: org
      });
    };

    /* search bar: go to lnglat */
    $scope.goto = function(lng, lat) {
      if (!!lng && !!lat) {
        console.log('map going to ' + lng + ':' + lat);
        var lnglat = [lng, lat],
            geocoder = $rootScope.geocoder,
            map = $rootScope.map;
        geocoder.getAddress(lnglat, function(status, result) {
          if (status === 'complete' && result.info === 'OK') {
            $.toast('当前位置: ' + result.regeocode.formattedAddress);
            map.setZoomAndCenter(18, lnglat);
          } else if (result.info !== 'OK') {
            $.toast('坐标查询失败!');
          }
        });
      } else {
        $.toast('请输入正确的经纬度坐标!');
      }
    };

    /* search bar: go to address */
    $scope.gotoAddr = function(addr) {
      if (!addr) {
        $.toast('请输入正确的地址或名称!');
      }else {
        var geocoder = $rootScope.geocoder,
          map = $rootScope.map;
        geocoder.getLocation(addr, function(status, result) {
          if (status === 'complete' && result.info === 'OK') {
            if (result.geocodes && result.geocodes.length === 1) {
              $.toast('当前位置: ' + result.geocodes[0].formattedAddress);
              map.setZoomAndCenter(18, result.geocodes[0].location);
            } else {
              console.log('more than one gps matches ' + addr);
            }
          } else if (result.info !== 'OK') {
            $.toast('查不到地址: ' + addr);
          }
        });
      }
    };

    $scope.setFloor = function(floor) {
      var targetFloor = eval(floor + 1); // jshint ignore:line
      console.log('set floor to ' + targetFloor);
      $rootScope.map.indoorMap.showFloor(targetFloor);
    };
  });
})();
