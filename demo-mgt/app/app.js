'use strict';

(function(){
  
  require('PouchDB');
  require('ui-router-extras'); 

  require('angular').module('demo', [
    require('angular-ui-router'),
    'ct.ui.router.extras',
    require('angular-pouchdb')
  ]);

  require('./');
  require('./shared');
  require('./orgs');

})();

