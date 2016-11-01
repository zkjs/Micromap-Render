'use strict';

(function(){
  require('angular').module('demo')

  .directive('ngEnter', function() {
    return function(scope, ele, attrs) {
      ele.bind('keydown keypress', function(e) {
        if (e.which === 13) {
          scope.$apply(function() {
            scope.$eval(attrs.ngEnter);
          });
          e.preventDefault();
        }
      });
    };
  });
})();
