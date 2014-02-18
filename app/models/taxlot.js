'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Article Schema
 */
var TaxLotSchema = new Schema({
    billingbbl: {
        type: Number  
    }
});



mongoose.model('TaxLot', TaxLotSchema);
