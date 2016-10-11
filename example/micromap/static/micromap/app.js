AMap.event.addListener(map, 'zoomend', function(){
  document.getElementById('info').innerHTML = 'current display level: ' + map.getZoom();
});

var clickEventListener = map.on('click', function(e){
  document.getElementById("lnglat").value = e.lnglat.getLng()+', '+ e.lnglat.getLat);
  
});
