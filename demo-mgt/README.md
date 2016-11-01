# Indoor Map Demo

This demo is implemented with [taobao SUI mobile](http://m.sui.taobao.org/) and [AngularJS](http://angularjs.org).

      npm install .
      gulp dev

## Data Model

- Organization

name | definition | description
-----|------------|-------------
id | string(15) |
title | string(50) | 组织机构名称
bounds | object{center(LngLat),SW(LngLat), NE(LngLat)} | 地图边界:中心点, 西南和东北角坐标
floors | number | 楼层总数
create | date | 创建时间
update | date | 最近更新时间
parent | organization_id | 父级组织

- Map

name | definition | description
-----|------------|-------------
id | string(15) |
longitude | number | 经度
latitude | number | 纬度
title | string(100) | 名称
address | string(100) | 地址
level | number(2) | 地图放大级别
drawables | document:{lnglat, drawable attributes...} | 可绘制对象
floor | number(2) | 当前楼层
create | date | 创建时间
update | date | 最近更新时间
parent | map_id | 父级对象
owner | organization_id | 所属组织机构

## Rendering

- AMap
