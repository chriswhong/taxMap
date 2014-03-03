'use strict';

var MongoClient = require('mongodb').MongoClient,
  Q = require('Q'),
  fs = require('fs'),
  csv = require('fast-csv'),
  colors = require('colors');

var condoBuilder = function () {

  var dbString = 'mongodb://127.0.0.1:27017/taxMap';
  var buildings = {};

  //Will get all districts, calculate all sums and save all to database.
  var parseMappings = function () {
    console.log('Parsing Condo <-> Building Mappings'.green);
    var deferred = Q.defer();
    var stream = fs.createReadStream('condobblmappings.csv');
    var mappings = {};
    var output = '';
    csv(stream, {headers: true})
      .on('data', function (data) {
        var buildbbl = parseInt(data.billbbl, 10);
        var condobbl = parseInt(data.condobbl, 10);
        if (Object.keys(buildings).indexOf(buildbbl) === -1) {

          //building object is keyed by building bbl each on is an object keyed by condo bbl that
          //will hold an object of condo data.
          var condos = {};
          condos[condobbl] = {};
          buildings[buildbbl] = condos;
        } else {
          if (!buildings[buildbbl][condobbl]) {
            buildings[buildbbl][condobbl] = {};
          }
        }

        //mappings object is keyed by condobbl.
        mappings[condobbl] = buildbbl;
      })
      .on('end', function () {
        console.log('Done Parsing Condo <-> Building Mappings'.green);
        deferred.resolve(mappings);
      })
      .parse();

    return deferred.promise;
  };

  var parseCondos = function (mappings) {
    console.log('Parsing Condo Data'.green);
    var deferred = Q.defer(),
      stream = fs.createReadStream('output.csv'),
      output = '',
      buildingbbl;

    csv(stream, { headers: true })
      .on('data', function (condo) {
// Sample:
//        { bbl: '1018931167.pdf',
//          ownerName: 'NOT ON FILE',
//          propertyAddress: '610 CATHEDRAL PKWY',
//          taxClass: '2 - Residential, More Than 10 Units',
//          estimatedValue: '106457',
//          assesedValue: '44751',
//          taxRate: '13.1450%',
//          taxBefore: '5883',
//          annualTax: '5883' }
        //add condo data to its proper spot in the buildings object.
        condo.condobbl = parseInt(condo.bbl.replace('.pdf', ''), 10);
        condo.annualTax = parseInt(condo.annualTax, 10);
        condo.taxBefore = parseInt(condo.taxBefore, 10);
        condo.assesedValue = parseInt(condo.assesedValue, 10);
        condo.estimatedMarketValue = parseInt(condo.estimatedValue, 10);
        delete condo.estimatedValue;
        delete condo.bbl;
        buildingbbl = mappings[condo.condobbl];

        //make sure this key exists on the buildings object.
        if (buildings.hasOwnProperty(buildingbbl)) {
          //add condo data to condo indexed array.
          buildings[buildingbbl][condo.condobbl] = condo;
        }
      })
      .on('end', function () {
        deferred.resolve(mappings);
      })
      .parse();

    return deferred.promise;
  };

  var fetchBuildings = function (mappings, db) {
    var keys = Object.keys(buildings);
    var output = 'Fetching data for ' + keys.length + ' buildings';
    console.log(output.green);
    var fetchPromises = keys.map(function (buildbbl) {
      return fetchBuilding(buildbbl, buildings[buildbbl], db);
    });

    return Q.all(fetchPromises);
  };

  var fetchBuilding = function (buildbbl, buildingCondos, db) {
    var d = Q.defer();
    buildbbl = parseInt(buildbbl, 10);
    db.collection('taxlots').findOne({billingbbl: buildbbl }, function (err, building) {
      if (building && building.hasOwnProperty('years')) {
        delete building._id;

        building.years[0].condoUnits = Object.keys(buildingCondos).map(function (condobbl) {
          return (buildingCondos.hasOwnProperty(condobbl)) ? buildingCondos[condobbl] : null;
        });

        var totalTax = 0;
        for (var c in buildingCondos) {
          if (buildingCondos.hasOwnProperty(c)) {
            if (!isNaN(buildingCondos[c].annualTax)) {
              totalTax += parseInt(buildingCondos[c].annualTax, 10);
            }
          }
        }
        building.years[0].annualTax = totalTax;
      }

      building = building || {};
      d.resolve(building);
    });

    return d.promise;
  };

  var saveBuildings = function (fetchedBuildings, db) {
    var output = 'Saving data for ' + fetchedBuildings.length + ' buildings';
    console.log(output.green);
    var savePromises = fetchedBuildings.map(function (building) {
      if(building.billingbbl) {
        return saveBuilding(building, db);
      }
    });

    return Q.all(savePromises);
  };

  var saveBuilding = function (building, db) {
    var d = Q.defer();
    building.billingbbl = parseInt(building.billingbbl, 10);
    var billingbbl = building.billingbbl;
    db.collection('taxlots').update({ 'billingbbl': building.billingbbl }, { $set: building }, {w : 1},
      function (err, bldg) {
        d.resolve(bldg);
      });
    return d.promise;
  };

  var build = function () {
    var mappings;
    console.log('Starting build'.red);
    MongoClient.connect(dbString, function (err, db) {
      parseMappings()
        .then(parseCondos)
        .then(function (mappings) {
          return fetchBuildings(mappings, db);
        })
        .then(function (fetchedBuildings) {
          return saveBuildings(fetchedBuildings, db);
        })
        .then(function (saved) {
          console.log('Database updated : ' + saved.length + ' saved.');
        }).finally(function () {
          db.close();
        });
    });
  };

  return  {
    build: build
  };

}();

condoBuilder.build();

