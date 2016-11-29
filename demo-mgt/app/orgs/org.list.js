'use strict';

(function(){
  var $ = require('zepto-browserify').$;
  require('angular').module('demo')

  .controller('c_orglist', function($scope, $state, $rootScope, drawTools, pouchDB, $stickyState, $http, CONST) {
    console.log('init finished!');
    /* clear previous sticket states,  if any */
    $stickyState.reset('*');
    /* update rootScope variables */
    $rootScope.title = 'XX单位地图对象';
    $rootScope.navbtn = '新增对象';
    $rootScope.navclick = function() {
      console.log('adding new org');
    };

    $scope.drawing = drawTools.drawing;
    drawTools.show();

    /* TODO remove for production */
    pouchDB('org').allDocs({include_docs: true})
    .then(function(orgs){
       $scope.orgs = orgs.rows.map(function(row){ return row.doc; });
    });


    //TODO get from remote server
    //$http({ method: 'GET', url: CONST.URL_ORGLIST })
    //.then(function successCallback(resp) {
    //  console.log('parse orgs ' + JSON.stringify(resp));
    //  if( 
    //      resp.status === 200 && 
    //      resp.data.status === 'ok'
    //  ){
    //    pouchDB('org').destroy().then(function(res){
    //      $scope.orgs = resp.data.data.map(function(org){
    //        org.parts = [];
    //        return org;
    //      });
    //      pouchDB('org').bulkDocs($scope.orgs).then(function(res){
    //        console.log('buildings loaded from remote server: ' + resp.data.data.length);
    //      });
    //    });
    //  }
    //}, function errorCallback(errResp){
    //  console.error('failed to fetch basic data ' + JSON.stringify(errResp));
    //});

    //$http({ method: 'GET',url: CONST.URL_APLIST})
    //.then(function successCallback(resp) {
    //  console.log('parse aplist ' + JSON.stringify(resp));
    //  if(
    //    resp.status === 200 &&
    //    resp.data.status === 'ok'
    //  ) {
    //    pouchDB('ap').bulkDocs(
    //      resp.data.map(function(ap) {
    //        if(!!ap.floor){
    //          ap._id = ap.floor + '.' + ap.id;
    //        }else{
    //          ap._id = ap.id;
    //        }
    //        ap.type = 'AMap.Marker';
    //        return ap;
    //      })
    //    ).then(function(res) {
    //      console.log('ap loaded from remote server ' );
    //    });
    //  }
    //}, function errorCallback(perr) {
    //  console.error('failed to cache ap list ' + perr);
    //});

    /* org item onclick: go to item's object list */
    $scope.manage = function(org) {
      /* before we go to next stage, clear current drawings */
      $scope.index = -1;
      $scope.drawing.state = 0;
      drawTools.clear();
      drawTools.hide();
      $state.go('part', { org: org });
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

    /**
     * show orgnization drawables
     */
    $scope.show = function(org, index){
      console.log('show ' + org._id);
      $scope.org = org;
      $scope.index = index;
      /* TODO use drawtools to draw org drawables */
      drawTools.clear(true);
      drawTools.show(org.drawables, org._id);
    };

    /**
     * if there are drawables, open editor 
     * if no drawables, show draw tools and gen drawid for the orgnization
     */
    $scope.edit = function(org, index){
      console.log('editing ' + org._id);
      $scope.org = org;
      $scope.index = index;
      drawTools.clear(true);
      drawTools.show(org.drawables, org._id, true);
      drawTools.draw(org._id);
    };

    $scope.del = function(org, index){
      /* TODO delete orginization from pouchdb and server after several seconds */
      console.log('deleting org' + org._id);
      $.toast('暂不支持删除该对象');
    };

    $scope.saveDraw = function(org, index) {
      console.log('saving drawing for org ' + org._id);
      drawTools.save(org._id, $scope, 'org');
    };

    $scope.cancelDraw = function(org, index) {
      console.log('canceling drawing for org ' + org._id);
      drawTools.cancel(org._id, true);
      /* cancel drawings and rerender objects */
      drawTools.clear();
      drawTools.show(org.drawables, org._id);
    };

  });
})();
