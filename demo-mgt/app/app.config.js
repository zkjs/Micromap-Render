'use strict';

(function(){

  var baseurl = 'http://localhost:8000/map/';

  require('angular').module('demo')

  .constant('CONST', {
    'URL_SAVEDRAWING': baseurl + ':partid/drawing',
    'URL_ORGLIST': baseurl + 'org',
    'URL_PARTLIST': baseurl + 'org/:orgid',
    'BLE_RANGE': 1200
  })

  .service('localdata', function($http, pouchDB){

    /* prepare root data */
    pouchDB('org').bulkDocs([{
      _id: '1',
      title: '住院楼',
      floors: 4,
      position: [104.203277,30.432479], //双流区太平镇卫生院
      drawables: [],
      //position: [104.059855, 30.640753], //成都华西医院
      parts: ['1','2','3','4']
    }, {
      _id: '2',
      title: '东门停车场',
      drawables: [],
      parts: []
    }, {
      _id: '3',
      title: '门诊部',
      drawables: [],
      floors: 5,
      parts: []
    }]);

    pouchDB('part').bulkDocs([{
      _id: '1',
      title: '一层护理',
      floor: 1,
      objects: 0,
      drawables: []
    },{
      _id: '2',
      title: '二层肿瘤',
      floor: 2,
      objects: 0,
      drawables: []
    },{
      _id: '3',
      title: '三层化验',
      floor: 3,
      objects: 0,
      drawables: []
    },{
      _id: '4',
      title: '四层高危',
      floor: 4,
      objects: 0,
      drawables: []
    }]);

  });

})();
