# Microlocation可绘制数据模型和渲染器设计 V0.1
曹朝


## 简介

为了兼容BLE定位、小区设施、路边停车场设施的自定义地图对象的绘制，保证一定的绘制效果，设计可绘制数据模型和渲染算法。目的是基于高德地图提供的部分功能，逐步实现自定义地图和对象的绘制能力。要求效果要优于滴滴打车界面中的小车的显示效果。

本版本V0.1 支持的可绘制对象有以下三种：

对象名|基于高德API|设计意图和效果
---|------|-------
点和文本标记|addMarker, addText|显示点标记的文本、图标；具备一定的交互效果和视觉效果；
线标记|addPolyline|显示一定效果的单线和折线，具备一定的状态更新和交互效果；
底图覆盖|addGroundOverlay|将图片嵌入地图图层

渲染引擎启动时，应获取和视角参数匹配的可交互对象。整个view支持：

- 支持有限级别的缩放；缩小时清空数据；限制显示对象的数量；
- 自动刷新可绘制对象的显示变量（如各种动态数据）：

## 可绘制对象封装

几个可绘制对象可以封装成一个交互对象。比如：

1个文本标签；1个线条；2者可共同属于一个停车位标记。标记应声明：

- 一致的绘制效果: 线条颜色，标签颜色，底色；
- 数据源：标签数据源的来源，应按照标记的id来从服务器动态获取；视图刷新时刷新。
- 点击效果：无论是线条点击还是标签点击，应有一致的弹出框；

地图对象数据结构：

- 父对象：设施实体（可能同时归属于2级的设施实体）：如车位的区域ParkingSection／小区设施级别(Unamed)
- 子对象：绘制实体

属性和方法表

项目|名称|描述
---|-----|-----
属性|ID|全局唯一索引
属性|ParentID|实体ID（可能可拆为2级）
属性|显示级别|和地图视角级别有关>2则该对象删除
属性|状态字典|kv字典，等于数据源返回的JSON
属性|数据源|服务器刷数据的api的path
属性|一致显示参数| fontColor, backgroundColor, fontSize, align, typeface, zIndex, lineWidth, lineColor, ..
属性|可绘制对象[ ]| 点、文本、线段、底图标记，后续扩展更多
方法|刷新状态|刷新所有状态字典内的值
方法|绘制显示|绘制或者重绘所有显示对象
方法|清空显示|显示／隐藏／释放数据

## 点标记
文档如：
`com.amap.api.maps2d.model.Marker`

类型：Marker

字段名|格式
----|----
Icon|图标
Icons|暂时不支持的图标数组
position|LatLng 经纬度标记
title|标题
snippet|说明字段
visible|是否可见
zIndex|覆盖物zIndex，继承父对象的zIndex

代码示例：

`		markerOption = new MarkerOptions();`
`		markerOption.position(Constants.XIAN);`
`		markerOption.title("西安市").snippet("西安市：34.341568, 108.940174");`
`		markerOption.draggable(true);`
`		markerOption.icon(BitmapDescriptorFactory`
`				.fromResource(R.drawable.arrow));`
`		marker2 = aMap.addMarker(markerOption);`

## 文本标记
文档见：
`com.amap.api.maps2d.model.Text`

类型：Text

字段名|格式
---|----
align|对齐
backgroundColor|背景颜色
fontColor|字体颜色
fontSize|字号，以上继承父对象属性
position|Latlng 地理坐标
rotation|旋转角度
visible|可见
typeface|字体
text|文本内容
zIndex|同父属性，应覆盖于其它绘制对象

代码示例：
`TextOptions textOptions = new` `TextOptions().position(Constants.BEIJING)`
`				.text("Text").fontColor(Color.BLACK)`
`				.backgroundColor(Color.BLUE).fontSize(30).rotate(20).align(Text.ALIGN_CENTER_HORIZONTAL,` 
`Text.ALIGN_CENTER_VERTICAL)`
`				.zIndex(1.f).typeface(Typeface.DEFAULT_BOLD);`		
`		aMap.addText(textOptions);`

## 线段标记
多段线段类
com.amap.api.maps2d.model

类型：Polyline

字段|格式
----|---
width|宽度，继承父对象
LatLng...|点列，以LatLng为格式
color|颜色，继承父对象
visible|可见性
zIndex|继承父对象后调整

代码示例：

`		polyline = aMap.addPolyline((new PolylineOptions())`
`				.add(Constants.SHANGHAI, Constants.BEIJING, Constants.CHENGDU)`
`				.width(10).color(Color.argb(255, 1, 1, 1)));`

## 底图标记

## 简单流程

1. 测绘: 利用三方地图选点、高德地图手动选点后获得准确数据，利用网页表单、或者将数据，按照约定格式录入数据库。
2. 展示: 安卓端通过API获取模型数据，并在高德SDK提供的地图覆层上进行展示。
3. 反馈和优化: 按照实际效果的需求，对模型在前端展示的要求进行进一步的优化。尤其是对动态数据展示方面，应与静态文档数据分开对待。



