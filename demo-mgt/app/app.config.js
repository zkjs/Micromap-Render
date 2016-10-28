'use strict';

(function(){
  require('angular').module('demo')

  .service('localdata', function($http, pouchDB){

    /* prepare root data TODO */
    pouchDB('org').bulkDocs([{
      _id: '1',
      title: '住院楼',
      floors: 4,
      parts: ['1','2','3','4']
    }, {
      _id: '2',
      title: '东门停车场',
      parts: []
    }, {
      _id: '3',
      title: '门诊部',
      floors: 5,
      parts: []
    }]);

    pouchDB('part').bulkDocs([{
      _id: '1',
      title: '一层护理',
      floor: 1,
      objects: 20,
      drawables: []
    },{
      _id: '2',
      title: '二层肿瘤',
      floor: 2,
      objects: 30,
      drawables: []
    },{
      _id: '3',
      title: '三层化验',
      floor: 3,
      objects: 10,
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
