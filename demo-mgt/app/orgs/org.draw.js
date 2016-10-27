'use strict';

angular.module('demo')

.controller('c_draw', function($scope, $state, $rootScope) {
  console.log('preparing drawing tools...');

  /* inherit map renderer from rootScope */
  var map = $rootScope.map,
    mouse = $rootScope.mousetool,
    drawOpt = {},
    mapContainer = $("#container");

  /* draw finished handlers */
  var drawn = function(e) {
    console.log("drawn " + e);
  }
  $scope.drawn = AMap.event.addListener(mouse, "draw", drawn);

  /* add key bindings: finish{ enter(13) } and cancel { esc(27) }*/
  var drawDone = function(e) {
    console.log('key pressed ' + JSON.stringify(drawOpt));
    if (e.which === 13 || e.which === 27) { //enter pressed
      mouse.close(e.which === 27);
      e.preventDefault();
      /* when triggered, remove the listener */
      mapContainer.off("keypress", drawDone);
    }
  };
  var addListeners = function() {
    mapContainer.on("keypress", drawDone);
  };

  /* draw tools */
  $scope.point = function() {
    addListeners();
    mouse.marker(drawOpt);
  };
  $scope.circle = function() {
    addListeners();
    mouse.circle(drawOpt);
  };
  $scope.polygon = function() {
    addListeners();
    mouse.polygon(drawOpt);
  };
  $scope.line = function() {
    addListeners();
    mouse.polyline(drawOpt);
  };
  $scope.rect = function() {
    addListeners();
    mouse.rectangle(drawOpt);
  };
});
