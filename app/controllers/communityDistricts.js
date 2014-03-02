/**
 * Created by akilharris on 3/1/14.
 */

var mongoose = require('mongoose'),
  CommunityDistrict = mongoose.model('CommunityDistrict'),
  _ = require('lodash');

//Fetch community districts inside bounding box.
exports.all = function (req, res) {
  //  http://localhost:3000/communityDistricts?bbox=40.785496,-73.980560,40.795342,-73.970861
  //  [ -74.01296138763428, 40.75362910810917, -73.97176265716553, 40.78184126814031 ]
  //  db.communityDistricts.find({ geometry :{ $geoIntersects :{ $geometry :{type : 'Polygon',coordinates :
  //  [[[-73.97176265716553, 40.75362910810917],[-73.97176265716553, 40.78184126814031],[-74.01296138763428,
  //  40.78184126814031],[-74.01296138763428, 40.75362910810917],[-73.97176265716553, 40.75362910810917]]]}}}})

  if (!req.query.bbox) { res.jsonp({}); }

  var bbox = req.query.bbox.split(',').map(function (e) { return parseFloat(e); }),
    topLeft = [bbox[2], bbox[1]],
    topRight = [bbox[2], bbox[3]],
    botRight = [bbox[0], bbox[3]],
    botLeft = [bbox[0], bbox[1]];

  CommunityDistrict.find({ 'geometry': {
    '$geoIntersects': {
      '$geometry': {
        type: 'Polygon', coordinates: [
          [topLeft, topRight, botRight, botLeft, topLeft]
        ]
      }
    }
  }
  }).exec(function (err, districts) {
      if (err) {
        console.error(err);
        res.render('error', {
          status: 500
        });
      } else {
        res.header('Access-Control-Allow-Origin', '*');
        res.jsonp(makeGeoJson(districts));
      }
    });
};

function makeGeoJson(districts) {
  var geoJson = {};

  geoJson.type = 'FeatureCollection';
  geoJson.features = districts.map(function (district) {
    //convert mongoose document to Object
    district = district.toObject();

    var properties = {};
    properties.taxTotal = district.taxTotal;
    properties.communityDistrict = district.properties.communityDistrict;

    var feature = {};
    feature.type = 'Feature';
    feature.id = district.id;
    feature.properties = properties;
    feature.geometry = district.geometry;

    return feature;
  });

  return geoJson;
}