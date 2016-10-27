'use strict';

angular.module('demo')

.controller('c_orglist', function($scope, $state, vorgs, $rootScope) {
  console.log('init finished!');
  /* update rootScope variables */
  $rootScope.title = 'XX单位地图对象';
  $rootScope.navbtn = '新增对象';
  $rootScope.navclick = function() {
    console.log('adding new org');
  }

  /* org list */
  $scope.orgs = vorgs;

  /* org item onclick: go to item's object list */
  $scope.manage = function(org) {
    $state.go('org', {
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
        } else if (result.info !== 'OK') $.toast('坐标查询失败!');
      });
    } else $.toast('请输入正确的经纬度坐标!');
  }

  /* search bar: go to address */
  $scope.gotoAddr = function(addr) {
    if (!addr) $.toast('请输入正确的地址或名称!');
    else {
      var geocoder = $rootScope.geocoder,
        map = $rootScope.map;
      geocoder.getLocation(addr, function(status, result) {
        if (status === 'complete' && result.info === 'OK') {
          if (result.geocodes && result.geocodes.length == 1) {
            $.toast('当前位置: ' + result.geocodes[0].formattedAddress);
            map.setZoomAndCenter(18, result.geocodes[0].location);
          } else {
            console.log('more than one gps matches ' + addr);
          }
        } else if (result.info !== 'OK') $.toast('查不到地址: ' + addr);
      });
    }
  }

  $scope.setFloor = function(floor) {
    var target_floor = eval(floor + 1);
    console.log('set floor to ' + target_floor);
    $rootScope.map.indoorMap.showFloor(target_floor);
  }
});
