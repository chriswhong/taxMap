'use strict';

// Articles routes use articles controller
var communityDistricts = require('../controllers/communityDistricts');

module.exports = function(app) {
  app.get('/communityDistricts', communityDistricts.all);
};