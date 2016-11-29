# Indoor Map Demo

This demo is implemented with [taobao SUI mobile](http://m.sui.taobao.org/) and [AngularJS](http://angularjs.org).

      npm install .
      gulp dev

## Data Model

- Organization

name | definition | description
-----|------------|-------------
id | string(32) |
title | string(32) | 组织机构名称
address | string(100) | 地址
floors | number | 楼层总数
longitude | number | 经度
latitude | number | 纬度
create | date | 创建时间
update | date | 最近更新时间
parent | organization id | 父级组织
bounds | object{center(LngLat), SW(LngLat), NE(LngLat)} | 地图边界:中心点, 西南和东北角坐标

- Part

name | definition | description
-----|------------|-------------
id | string(32) |
title | string(32) | 名称
floor | number(2) | 所处楼层
create | date | 创建时间
update | date | 最近更新时间
parent | map id | 父级对象
owner | organization id | 所属组织机构

- Drawable

name | definition | description
-----|------------|-------------
id | string(32) |
title | string(32) | 地标名称
type  | string(32) | 绘制实体类型: 'AMap.Circle', 'AMap.Marker', 'AMap.Polygon', etc.
data | document/object | 绘制实体数据
longitude | number | 经度, 实体的中心位置, 用于显示标记信息
latitude | number | 纬度, 实体的中心位置, 用于显示标记信息
level | number | 地图可见级别, 当地图显示级别达到该值后, 该实体才会被显示
create | date | 创建时间
update | date | 最近更新时间
part | string(32) | 所属区域或组织机构

### API

- organization list [GET /map/org]

            {
              status: 'ok',
              data: [{
                id: '1',
                title: '医院住院楼',
                address: '地址',
                floors: 3,
                longitude: 111.11,
                latitude: 23.23,
                drawables: [{
                  id: '111',
                  title: '某个点',
                  type: 'AMap.Circle',
                  longitude: 111.11,
                  latitude: 23.23,
                  data: {...}
                }]
              }]
            }

- part list [GET /map/org/{orgid}]

            {
              status: 'ok',
              data: [{
                id: '1',
                title: '二层肿瘤科',
                floor: 3,
                drawables: [{
                  id: '111',
                  title: '某个点',
                  type: 'AMap.Circle',
                  longitude: 111.11,
                  latitude: 23.23,
                  data: {...}
                }]
              }]
            }

- add drawing [POST /map/{partid/orgid}/drawing]

  - request

            {
              part: '1',
              drawing: [{
                title: '某个点',
                type: 'AMap.Polygon',
                longitude: 111.11,
                latitude: 23.23,
                data: {...}
              }]
            }

  - response

            {
              status: 'ok'
            }

- AP list [GET /ap]

          {
            status: 'ok',
            data: [{
              id: '1',
              name: '1',
              floor: 1,
              height: 2.3,
              address: '某处',
              longitude: 1,
              latitude: 2,
              status: 1
            }]
          }


- update AP [PUT /ap]

  - request

          [{
            id: '1',
            height: 2.0,
            floor: 1,
            longitude: 20,
            latitude: 30,
            address: '某处'
          },{
            id: '2',
            height: 2.0,
            floor: 1,
            longitude: 20,
            latitude: 30,
            address: '某处'
          }]

  - response

          {
            status: 'ok'
          } 

## Rendering

- AMap

use [AMap API](http://lbs.amap.com/api/javascript-api/reference/)
