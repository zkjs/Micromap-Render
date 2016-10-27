'use strict';

/* Zepto */
$ = require('zepto-browserify').$;

var angular = require('angular');
require('angular-ui-router');

angular.module('demo', [
  'ui.router'
]);

require('./');
require('./shared');
require('./orgs');
