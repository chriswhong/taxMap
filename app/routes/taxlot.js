'use strict';

// Articles routes use articles controller
var taxlots = require('../controllers/taxlots');

module.exports = function(app) {

    app.get('/taxlots', taxlots.all);

};