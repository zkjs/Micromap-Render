angular.module('demo', ['ui.router', 'controllers'])
.service('sdata', function(){
  this.orgs = function(){
    return [{
      title: 'hello'
    },{
      title: 'world'
    },{
      title: 'demo'
    },{
      title: 'testing'
    }]
  }
})
.config(function($urlRouterProvider, $stateProvider, $locationProvider){
  $stateProvider.state('init',{
    url: '/', templateUrl: '/tpl/init.html', controller: 'c_init'
  });
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true)
})
.run(function($rootScope, $window, $state, $location){
  $rootScope.title='XX单位地图对象';
  $rootScope.setFloor = function(floor){
    var target_floor = eval(floor+1);
    console.log('set floor to ' + target_floor);
    $rootScope.map.indoorMap.showFloor(target_floor);
  }

  var map = new AMap.Map('container', {
    zoom: 18,
    resizeEnable: true,
  });
  map.on('indoor_create', function() {
    map.indoorMap.showIndoorMap('B000A856LJ', 5);
  });
  $rootScope.map = map;

});

angular.module('controllers', [])
.controller('c_init', function($scope, $state, sdata){
  console.log('init finished!')
  $scope.orgs = sdata.orgs();
});
