console.log("Hello, World!");

var MongoClient = require('mongodb').MongoClient
, format = require('util').format;

var fs = require('fs');
var csv = require("fast-csv");

var stream = fs.createReadStream("billingBBLdata.csv");

MongoClient.connect('mongodb://127.0.0.1:27017/taxMap', function(err, db) {
	if (err) throw err;
	console.log("Connected to Database");

	csv(stream, {headers : true})
	 .on("data", function(data){

	 	var updateObject = new Object;

	 	updateObject.billingbbl = parseInt(data.bbl);
	 	updateObject.propertyAddress = data.propertyAddress;
	 	updateObject.ownerName = data.ownerName;
	 	updateObject.taxClass = data.taxClass;
	 	updateObject.years = [];
	 	var year = new Object;
	 	year.taxYear='1314';
	 		
	 	if (!isNaN(parseInt(data.estimatedValue))){
	 		year.estimatedValue = parseInt(data.estimatedValue);
	 	}; 

	 	if (!isNaN(parseInt(data.estimatedValue))){
	 		year.estimatedValue = parseInt(data.estimatedValue);
	 	};

	 	if (!isNaN(parseInt(data.asessedValue))){
	 		year.estimatedValue = parseInt(data.assessedValue);
	 	};

	 		year.taxRate = data.taxRate;

	 	if (!isNaN(parseInt(data.taxBefore))){
	 		year.taxBefore = parseInt(data.taxBefore);
	 	};

	 	if (!isNaN(parseInt(data.annualTax))){
	 		year.annualTax = parseInt(data.annualTax);
	 	};

	 	
	 	updateObject.years.push(year);

	 	console.log(updateObject);
	 	
	 	db.collection('taxLots').update(
	 		{'plutoData.BBL':parseInt(data.bbl) },
	 		{$set:updateObject},
	 		function(err){
	 			if (err) throw err;
	 			console.log(data.bbl);
	 		}
	 	);
	 })
	 .on("end", function(){
	     console.log("done");
	 })
	 .parse();

 });