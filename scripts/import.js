console.log("Hello, World!");

var MongoClient = require('mongodb').MongoClient
, format = require('util').format;

var fs = require('fs');

fs.readFile('./manhattanPlutoRaw.geojson', 'utf-8', function read(err, contents) {
	if (err) throw err;
	var data = []
	data = JSON.parse(contents);
	data = data.features;

	MongoClient.connect('mongodb://127.0.0.1:27017/taxMap', function(err, db) {
		if (err) throw err;
		console.log("Connected to Database");

		data.forEach(function (d,i){

			if (d.geometry.type == 'MultiPolygon'){
				console.log("Dropped MultiPolygon");
			} else {

				//reformat our object, keep all the PLUTO goodies in case, but remove them from the properties object

				//elevate properties objects to higher level
				//remove type 
				
				d.plutoData = d.properties;
				delete d.type;
				delete d.properties;
				//for (var property in d.properties){
				//	d[property]=d.properties[property];
				//}


				db.collection('taxLots').insert(d, function(err, records) {
					if (err) throw err;
					console.log("Record added as "+records[0]._id);
				})
			}
		});
	});
});