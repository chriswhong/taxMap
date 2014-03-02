'use strict';
/**
 * Created by akilharris on 3/1/14.
 */


var MongoClient = require('mongodb').MongoClient,
  Q = require('Q');


var lotCalc = function () {

  var dbString = 'mongodb://127.0.0.1:27017/taxMap';

  var calcOne = function () {
    MongoClient.connect(dbString, function (err, db) {
      getOneDistrict().then(function (document) {
        return sumTaxLots(document.geometry, document._id, db);
      }).then(function (total) {
          console.log(document.properties.communityDistrict, total.total, total._id);
          return;
      });
    });
  };

  var calcAll = function() {
    MongoClient.connect(dbString, function (err, db) {
      getAllDistricts(db).then(function (documents) {
        console.log('fetched all community board districts');
        var calcPromises = documents.map(function (document) {
          return sumTaxLots(document.geometry, document._id, db);
        });
        Q.all(calcPromises).then(function (districtTotals) {
            console.log('calculated all community board district sums');
            var savePromises = districtTotals.map(function(district) {
              return saveDistrict(district.id, district.total, db);
            });
            return Q.all(savePromises);
          }).fin(function () {
            db.close();
            console.log('updated all community board districts.');
            return;
          });
      });
    });
  };

  var getOneDistrict = function() {
    var deferred = Q.defer();
    MongoClient.connect(dbString, function (err, db) {
      db.collection('communityDistricts').findOne(deferred.makeNodeResolver());
    });
    return deferred.promise;
  };

  var getAllDistricts = function(db) {
    var deferred = Q.defer();
    MongoClient.connect(dbString, function (err, db) {
      db.collection('communityDistricts').find().toArray(deferred.makeNodeResolver());
    });
    return deferred.promise;
  };

  var sumTaxLots = function(districtGeometry, districtObjId, db) {
    var deferred = Q.defer();

    var lotQuery = { 'years': { '$elemMatch': { 'annualTax': { '$gt': 0 }}},
      'geometry': { '$geoIntersects': { '$geometry': districtGeometry } } };

    var total = {
      total: 0,
      id: districtObjId
    };

    db.collection('taxlots').find(lotQuery).toArray(function (err, documents) {
        for (var i = 0, len = documents.length; i < len; i++) {
          total.total += documents[i].years[0].annualTax;
        }
        deferred.resolve(total);
      });

    return deferred.promise;
  };

  var saveDistrict = function(id, total, db) {
    var d = Q.defer();
    console.log(id, total);
    db.collection('communityDistricts').update({_id: id }, { $set: { taxTotal: total } }, d.makeNodeResolver());
    return d.promise;
  };

  return  {
    calcOne:calcOne,
    calcAll:calcAll
  };

}();

//lotCalc.calcOne();
lotCalc.calcAll();