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
    // TaxLot.find({billingbbl:1018880063}).exec(function(err, taxlots) {
    
    // expecting bbox=X1,Y1,X2,Y2 where X1,Y1 = TL, and X2,Y2 = BR ... X1>X2, Y1<Y2
    console.log(req.query);
    if (!req.query.bbox) res.jsonp({});
    var bbox = req.query.bbox.split(',').map(function (e) { return parseFloat(e); });
    var topLeft = [bbox[0], bbox[1]];
    var topRight = [bbox[2], bbox[1]];
    var botRight = [bbox[2], bbox[3]];
    var botLeft = [bbox[0], bbox[3]];

    console.log(topLeft, topRight, botRight, botLeft);

    TaxLot.find({"geometry":{"$geoWithin":{"$geometry":{type:"Polygon",coordinates:[[topLeft, topRight, botRight, botLeft, topLeft]]}}}}).exec(function(err, taxlots) {

        console.log("called all");
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(taxlots);
        }
    });
}