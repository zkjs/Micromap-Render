AMap.event.addListener(map, 'zoomend', function(){
  document.getElementById('info').innerHTML = 'current display level: ' + map.getZoom();
});

var clickEventListener = map.on('click', function(e){
  document.getElementById("lnglat").value = e.lnglat.getLng()+', '+ e.lnglat.getLat();  
});

//{% for obj in objects %}
//first loop
objArray.forEach(function (obj) {
switch (obj.type) {

  case 'Marker':
    
    var marker = new AMap.Marker({
      position: [obj.lnglat[0],obj.lnglat[1]]
    });
    marker.setMap(map);
    marker.setLabel({
      offset: new AMap.Pixel(20, 20),
      content: obj.text
    });
    break;

  case 'Polygon':
    var polygonArr = new Array();
    //{% for point in obj.path %}
    obj.path.forEach(function (point){
    //second loop
    polygonArr.push(point);
    })
    //{% endfor %}
    var polygon = new AMap.Polygon({
      path: polygonArr,
      strokeColor: "#FF33FF",
      strokeWeight: 4,
      fillColor: "#1791fc",
    });
    polygon.setMap(map);
    break;


  default:
    break;

}
});
//{% endfor %}
