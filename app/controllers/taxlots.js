'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    TaxLot = mongoose.model('TaxLot'),
    _ = require('lodash');


/**
 * Get Tax Lots for bounding box
 */
exports.all = function(req, res) {
    // TaxLot.find({billingbbl:1018880063}).exec(function(err, taxlots) {

    // expecting bbox=bottom,left,top,right
    // like: http://localhost:3000/taxlots?bbox=40.785496,-73.980560,40.795342,-73.970861

    if (!req.query.bbox) res.jsonp({});
    var bbox = req.query.bbox.split(',').map(function (e) { return parseFloat(e); });

    var topLeft = [bbox[2], bbox[1]];
    var topRight = [bbox[2], bbox[3]];
    var botRight = [bbox[0], bbox[3]];
    var botLeft = [bbox[0], bbox[1]];

    //console.log(topLeft, topRight, botRight, botLeft);

  //  TaxLot.find({"geometry":{"$geoWithin":{"$geometry":{type:"Polygon",coordinates:[[topLeft, topRight, botRight, botLeft, topLeft]]}}}}).exec(function(err, taxlots) {
      TaxLot.find({"geometry":{"$geoIntersects":{"$geometry":{type:"Polygon",coordinates:[[topLeft, topRight, botRight, botLeft, topLeft]]}}}}).exec(function(err, taxlots) {
        //console.log("called all");
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(makeGeoJson(taxlots));
        }
    });
}

function makeGeoJson(taxlots) {

    var geoJson = new Object;
    var counter = 0;

    geoJson.type = "FeatureCollection";

    geoJson.features = taxlots.map(function (taxlot) {

        //convert mongoose document to Object
        taxlot = taxlot.toObject();
        //console.log(taxlot);

        var properties = new Object;
        properties.billingbbl = taxlot.billingbbl;
        properties.ownerName = taxlot.ownerName;
        properties.propertyAddress = taxlot.propertyAddress;
        properties.taxClass = taxlot.taxClass;
        properties.years = taxlot.years;
        properties.unitsTotal = taxlot.plutoData.UnitsTotal;
        properties.condoNumber = taxlot.plutoData.CondoNo;

        var feature = new Object;
        feature.type = "Feature";
        feature.id = counter;
        feature.properties = properties;
        feature.geometry = taxlot.geometry;

        counter++;
        return feature;
    });

    return geoJson;
}
