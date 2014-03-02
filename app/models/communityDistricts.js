'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var CommunityDistrictSchema = new Schema({
  id: {
    type: Number
  }
});

mongoose.model('CommunityDistrict', CommunityDistrictSchema, 'communityDistricts');
