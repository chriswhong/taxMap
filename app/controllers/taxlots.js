'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    TaxLot = mongoose.model('TaxLot'),
    _ = require('lodash');


/**
 * List of Articles
 */
exports.all = function(req, res) {
    TaxLot.find({billingbbl:1018880063}).exec(function(err, taxlots) {

        console.log("called all");
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(taxlots);
        }
    });
};
