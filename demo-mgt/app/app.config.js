'use strict';

(function(){

  var baseurl = 'http://localhost:8000/map/';

  require('angular').module('demo')

  .constant('CONST', {
    'URL_SAVEDRAWING': baseurl + ':partid/drawing',
    'URL_ORGLIST': baseurl + 'org',
    'URL_PARTLIST': baseurl + 'org/:orgid',
    'URL_APLIST': baseurl + 'ap',
    'BLE_RANGE': 800
  })

  .service('localdata', function($http, pouchDB){

    /* prepare ap data */
    pouchDB('ap').bulkDocs([{
      _id: '8238102',
      status: 0
    },{
      _id: '82381LT',
      status: 0
    },{
      _id: '21381A',
      status: 0
    },{
      _id: 'a90381M',
      status: 0
    }]);

    /* prepare root data */
    pouchDB('org').bulkDocs([{
      _id: '1',
      title: '住院楼',
      floors: 4,
      position: [104.203277,30.432479], //双流区太平镇卫生院
      drawables: [],
      //position: [104.059855, 30.640753], //成都华西医院
      parts: ['1','2','3','4','5']
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
      _id: '1.1',
      title: '一层',
      floor: 1,
      objects: 0,
      drawables: [{
        title: '',
        type: 'AMap.Polygon',
        data: { path: [[0,0],[5040,0],[5040,488],[0, 488]] }
      },{
        title: '',
        type: 'AMap.Polygon',
        data: { path: [[0,732],[5040,732],[5040,1220],[0, 1220]] }
      }]
    },{
      _id: '1.2',
      title: '二层妇产科',
      floor: 2,
      objects: 0,
      drawables: [{
        title: '杂物间',
        type: 'AMap.Polygon',
        data: { path: [[0,0],[144,0],[144,488],[0, 488]] }
      },{
        title: '电梯间',
        type: 'AMap.Polygon',
        data: { path: [[144,0],[360,0],[360,488],[144, 488]] }
      },{
        title: '护士站',
        type: 'AMap.Polygon',
        data: { path: [[360,0],[720,0],[720,488],[360, 488]] }
      },{
        title: '值班室',
        type: 'AMap.Polygon',
        data: { path: [[720,0],[1080,0],[1080,488],[720, 488]] }
      },{
        title: '第一治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1080,0],[1440,0],[1440,488],[1080, 488]] }
      },{
        title: '第二治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1440,0],[1800,0],[1800,488],[1440, 488]] }
      },{
        title: '一病房',
        type: 'AMap.Polygon',
        data: { path: [[1800,0],[2160,0],[2160,488],[1800, 488]] }
      },{
        title: '二病房',
        type: 'AMap.Polygon',
        data: { path: [[2160,0],[2520,0],[2520,488],[2160, 488]] }
      },{
        title: '三病房',
        type: 'AMap.Polygon',
        data: { path: [[2520,0],[2880,0],[2880,488],[2520, 488]] }
      },{
        title: '胎监室',
        type: 'AMap.Polygon',
        data: { path: [[2880,0],[3240,0],[3240,488],[2880, 488]] }
      },{
        title: '产房',
        type: 'AMap.Polygon',
        data: { path: [[3240,0],[4680,0],[4680,1220],[3240, 1220]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4680,0],[5040,0],[5040,488],[4680, 488]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[0,732],[360,732],[360,1220],[0, 1220]] }
      },{
        title: '医生办公室',
        type: 'AMap.Polygon',
        data: { path: [[360,732],[720,732],[720,1220],[360, 1220]] }
      },{
        title: '抢救室',
        type: 'AMap.Polygon',
        data: { path: [[720,732],[1080,732],[1080,1220],[720, 1220]] }
      },{
        title: '五病房',
        type: 'AMap.Polygon',
        data: { path: [[1080,732],[1440,732],[1440,1220],[1080, 1220]] }
      },{
        title: '四病房',
        type: 'AMap.Polygon',
        data: { path: [[1440,732],[1800,732],[1800,1220],[1440, 1220]] }
      },{
        title: '库房',
        type: 'AMap.Polygon',
        data: { path: [[1800,732],[2160,732],[2160,1220],[1800, 1220]] }
      },{
        title: '女厕',
        type: 'AMap.Polygon',
        data: { path: [[2160,862],[2520,862],[2520,1220],[2160, 1220]] }
      },{
        title: '男厕',
        type: 'AMap.Polygon',
        data: { path: [[2520,862],[2880,862],[2880,1220],[2520, 1220]] }
      },{
        title: '新生儿沐浴室',
        type: 'AMap.Polygon',
        data: { path: [[2880,732],[3240,732],[3240,1220],[2880, 1220]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[4680,732],[5040,732],[5040,1220],[4680, 1220]] }
      }]
    },{
      _id: '1.3',
      title: '三层',
      floor: 3,
      objects: 0,
      drawables: [{
        title: '杂物间',
        type: 'AMap.Polygon',
        data: { path: [[0,0],[144,0],[144,488],[0, 488]] }
      },{
        title: '电梯间',
        type: 'AMap.Polygon',
        data: { path: [[144,0],[360,0],[360,488],[144, 488]] }
      },{
        title: '护士站',
        type: 'AMap.Polygon',
        data: { path: [[360,0],[720,0],[720,488],[360, 488]] }
      },{
        title: '值班室',
        type: 'AMap.Polygon',
        data: { path: [[720,0],[1080,0],[1080,488],[720, 488]] }
      },{
        title: '抢救室',
        type: 'AMap.Polygon',
        data: { path: [[1080,0],[1440,0],[1440,488],[1080, 488]] }
      },{
        title: '第一治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1440,0],[1800,0],[1800,488],[1440, 488]] }
      },{
        title: '第二治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1800,0],[2160,0],[2160,488],[1800, 488]] }
      },{
        title: '三病房',
        type: 'AMap.Polygon',
        data: { path: [[2160,0],[2520,0],[2520,488],[2160, 488]] }
      },{
        title: '四病房',
        type: 'AMap.Polygon',
        data: { path: [[2520,0],[2880,0],[2880,488],[2520, 488]] }
      },{
        title: '五病房',
        type: 'AMap.Polygon',
        data: { path: [[2880,0],[3240,0],[3240,488],[2880, 488]] }
      },{
        title: '六病房',
        type: 'AMap.Polygon',
        data: { path: [[3240,0],[3600,0],[3600,488],[3240, 488]] }
      },{
        title: '七病房',
        type: 'AMap.Polygon',
        data: { path: [[3600,0],[3960,0],[3960,488],[3600, 488]] }
      },{
        title: '八病房',
        type: 'AMap.Polygon',
        data: { path: [[3960,0],[4320,0],[4320,488],[3960, 488]] }
      },{
        title: '九病房',
        type: 'AMap.Polygon',
        data: { path: [[4320,0],[4680,0],[4680,488],[4320, 488]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4680,0],[5040,0],[5040,488],[4680, 488]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[0,732],[360,732],[360,1220],[0, 1220]] }
      },{
        title: '医生办公室',
        type: 'AMap.Polygon',
        data: { path: [[360,732],[720,732],[720,1220],[360, 1220]] }
      },{
        title: '十五病房',
        type: 'AMap.Polygon',
        data: { path: [[720,732],[1110,732],[1110,1220],[720, 1220]] }
      },{
        title: '十四病房',
        type: 'AMap.Polygon',
        data: { path: [[1110,732],[1500,732],[1500,1220],[1110, 1220]] }
      },{
        title: '十三病房',
        type: 'AMap.Polygon',
        data: { path: [[1500,732],[1890,732],[1890,1220],[1500, 1220]] }
      },{
        title: '十二病房',
        type: 'AMap.Polygon',
        data: { path: [[1890,732],[2280,732],[2280,1220],[1890, 1220]] }
      },{
        title: '十一病房',
        type: 'AMap.Polygon',
        data: { path: [[2280,732],[2640,732],[2640,1220],[2280, 1220]] }
      },{
        title: '库房',
        type: 'AMap.Polygon',
        data: { path: [[2640,732],[2830,732],[2830,1220],[2640, 1220]] }
      },{
        title: '卫生间',
        type: 'AMap.Polygon',
        data: { path: [[2830,732],[3250,732],[3250,1220],[2830, 1220]] }
      },{
        title: '十病房',
        type: 'AMap.Polygon',
        data: { path: [[3250,732],[3610,732],[3610,1220],[3250, 1220]] }
      },{
        title: '护士夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3610,732],[3970,732],[3970,1220],[3610, 1220]] }
      },{
        title: '医生夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3970,732],[4320,732],[4320,1220],[3970, 1220]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4320,732],[4680,732],[4680,1220],[4320, 1220]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[4680,732],[5040,732],[5040,1220],[4680, 1220]] }
      }]
    },{
      _id: '1.4',
      title: '四层',
      floor: 4,
      objects: 0,
      drawables: [{
        title: '杂物间',
        type: 'AMap.Polygon',
        data: { path: [[0,0],[144,0],[144,488],[0, 488]] }
      },{
        title: '电梯间',
        type: 'AMap.Polygon',
        data: { path: [[144,0],[360,0],[360,488],[144, 488]] }
      },{
        title: '护士站',
        type: 'AMap.Polygon',
        data: { path: [[360,0],[720,0],[720,488],[360, 488]] }
      },{
        title: '值班室',
        type: 'AMap.Polygon',
        data: { path: [[720,0],[1080,0],[1080,488],[720, 488]] }
      },{
        title: '抢救室',
        type: 'AMap.Polygon',
        data: { path: [[1080,0],[1440,0],[1440,488],[1080, 488]] }
      },{
        title: '第一治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1440,0],[1800,0],[1800,488],[1440, 488]] }
      },{
        title: '第二治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1800,0],[2160,0],[2160,488],[1800, 488]] }
      },{
        title: '换药室',
        type: 'AMap.Polygon',
        data: { path: [[2160,0],[2520,0],[2520,488],[2160, 488]] }
      },{
        title: '四病房',
        type: 'AMap.Polygon',
        data: { path: [[2520,0],[2880,0],[2880,488],[2520, 488]] }
      },{
        title: '五病房',
        type: 'AMap.Polygon',
        data: { path: [[2880,0],[3240,0],[3240,488],[2880, 488]] }
      },{
        title: '六病房',
        type: 'AMap.Polygon',
        data: { path: [[3240,0],[3600,0],[3600,488],[3240, 488]] }
      },{
        title: '七病房',
        type: 'AMap.Polygon',
        data: { path: [[3600,0],[3960,0],[3960,488],[3600, 488]] }
      },{
        title: '八病房',
        type: 'AMap.Polygon',
        data: { path: [[3960,0],[4320,0],[4320,488],[3960, 488]] }
      },{
        title: '九病房',
        type: 'AMap.Polygon',
        data: { path: [[4320,0],[4680,0],[4680,488],[4320, 488]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4680,0],[5040,0],[5040,488],[4680, 488]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[0,732],[360,732],[360,1220],[0, 1220]] }
      },{
        title: '医生办公室',
        type: 'AMap.Polygon',
        data: { path: [[360,732],[720,732],[720,1220],[360, 1220]] }
      },{
        title: '十五病房',
        type: 'AMap.Polygon',
        data: { path: [[720,732],[1110,732],[1110,1220],[720, 1220]] }
      },{
        title: '十四病房',
        type: 'AMap.Polygon',
        data: { path: [[1110,732],[1500,732],[1500,1220],[1110, 1220]] }
      },{
        title: '十三病房',
        type: 'AMap.Polygon',
        data: { path: [[1500,732],[1890,732],[1890,1220],[1500, 1220]] }
      },{
        title: '十二病房',
        type: 'AMap.Polygon',
        data: { path: [[1890,732],[2280,732],[2280,1220],[1890, 1220]] }
      },{
        title: '十一病房',
        type: 'AMap.Polygon',
        data: { path: [[2280,732],[2640,732],[2640,1220],[2280, 1220]] }
      },{
        title: '库房',
        type: 'AMap.Polygon',
        data: { path: [[2640,732],[2830,732],[2830,1220],[2640, 1220]] }
      },{
        title: '卫生间',
        type: 'AMap.Polygon',
        data: { path: [[2830,732],[3250,732],[3250,1220],[2830, 1220]] }
      },{
        title: '十病房',
        type: 'AMap.Polygon',
        data: { path: [[3250,732],[3610,732],[3610,1220],[3250, 1220]] }
      },{
        title: '护士夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3610,732],[3970,732],[3970,1220],[3610, 1220]] }
      },{
        title: '医生夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3970,732],[4320,732],[4320,1220],[3970, 1220]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4320,732],[4680,732],[4680,1220],[4320, 1220]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[4680,732],[5040,732],[5040,1220],[4680, 1220]] }
      }]
    },{
      _id: '1.5',
      title: '五层',
      floor: 5,
      objects: 0,
      drawables: [{
        title: '杂物间',
        type: 'AMap.Polygon',
        data: { path: [[0,0],[144,0],[144,488],[0, 488]] }
      },{
        title: '电梯间',
        type: 'AMap.Polygon',
        data: { path: [[144,0],[360,0],[360,488],[144, 488]] }
      },{
        title: '护士站',
        type: 'AMap.Polygon',
        data: { path: [[360,0],[720,0],[720,488],[360, 488]] }
      },{
        title: '值班室',
        type: 'AMap.Polygon',
        data: { path: [[720,0],[1080,0],[1080,488],[720, 488]] }
      },{
        title: '抢救室',
        type: 'AMap.Polygon',
        data: { path: [[1080,0],[1440,0],[1440,488],[1080, 488]] }
      },{
        title: '第一治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1440,0],[1800,0],[1800,488],[1440, 488]] }
      },{
        title: '第二治疗室',
        type: 'AMap.Polygon',
        data: { path: [[1800,0],[2160,0],[2160,488],[1800, 488]] }
      },{
        title: '换药室',
        type: 'AMap.Polygon',
        data: { path: [[2160,0],[2520,0],[2520,488],[2160, 488]] }
      },{
        title: '四病房',
        type: 'AMap.Polygon',
        data: { path: [[2520,0],[2880,0],[2880,488],[2520, 488]] }
      },{
        title: '五病房',
        type: 'AMap.Polygon',
        data: { path: [[2880,0],[3240,0],[3240,488],[2880, 488]] }
      },{
        title: '六病房',
        type: 'AMap.Polygon',
        data: { path: [[3240,0],[3600,0],[3600,488],[3240, 488]] }
      },{
        title: '七病房',
        type: 'AMap.Polygon',
        data: { path: [[3600,0],[3960,0],[3960,488],[3600, 488]] }
      },{
        title: '八病房',
        type: 'AMap.Polygon',
        data: { path: [[3960,0],[4320,0],[4320,488],[3960, 488]] }
      },{
        title: '九病房',
        type: 'AMap.Polygon',
        data: { path: [[4320,0],[4680,0],[4680,488],[4320, 488]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4680,0],[5040,0],[5040,488],[4680, 488]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[0,732],[360,732],[360,1220],[0, 1220]] }
      },{
        title: '医生办公室',
        type: 'AMap.Polygon',
        data: { path: [[360,732],[720,732],[720,1220],[360, 1220]] }
      },{
        title: '十五病房',
        type: 'AMap.Polygon',
        data: { path: [[720,732],[1110,732],[1110,1220],[720, 1220]] }
      },{
        title: '十四病房',
        type: 'AMap.Polygon',
        data: { path: [[1110,732],[1500,732],[1500,1220],[1110, 1220]] }
      },{
        title: '十三病房',
        type: 'AMap.Polygon',
        data: { path: [[1500,732],[1890,732],[1890,1220],[1500, 1220]] }
      },{
        title: '十二病房',
        type: 'AMap.Polygon',
        data: { path: [[1890,732],[2280,732],[2280,1220],[1890, 1220]] }
      },{
        title: '十一病房',
        type: 'AMap.Polygon',
        data: { path: [[2280,732],[2640,732],[2640,1220],[2280, 1220]] }
      },{
        title: '库房',
        type: 'AMap.Polygon',
        data: { path: [[2640,732],[2830,732],[2830,1220],[2640, 1220]] }
      },{
        title: '卫生间',
        type: 'AMap.Polygon',
        data: { path: [[2830,732],[3250,732],[3250,1220],[2830, 1220]] }
      },{
        title: '十病房',
        type: 'AMap.Polygon',
        data: { path: [[3250,732],[3610,732],[3610,1220],[3250, 1220]] }
      },{
        title: '护士夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3610,732],[3970,732],[3970,1220],[3610, 1220]] }
      },{
        title: '医生夜间值班室',
        type: 'AMap.Polygon',
        data: { path: [[3970,732],[4320,732],[4320,1220],[3970, 1220]] }
      },{
        title: '空',
        type: 'AMap.Polygon',
        data: { path: [[4320,732],[4680,732],[4680,1220],[4320, 1220]] }
      },{
        title: '楼梯',
        type: 'AMap.Polygon',
        data: { path: [[4680,732],[5040,732],[5040,1220],[4680, 1220]] }
      }]
    }]);

  });

})();
