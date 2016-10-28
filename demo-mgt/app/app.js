'use strict';

(function(){
  
  require('PouchDB');

  require('angular').module('demo', [
    require('angular-ui-router'),
    require('angular-pouchdb')
  ]);

  require('./');
  require('./shared');
  require('./orgs');

})();

