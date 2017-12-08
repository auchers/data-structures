var fs = require('fs');

var runningLength = 0;

var files = ['m01','m02','m03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10'];
var url = process.env.ATLAS;

for (f in files){
    console.log(`working on file ${files[f]}`);
    let meetings = JSON.parse(fs.readFileSync(`data/parsed_${files[f]}.json`));
    runningLength += meetings.length;
    console.log(`meetings legnth:${meetings.length} and total length: ${runningLength}`);

    // Retrieve
    let MongoClient = require('mongodb').MongoClient; // npm install mongodb

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}

        let collection = db.collection('meetings');

        // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
        collection.insert(meetings);
        db.close();

    }); //MongoClient.connect
}

// Connection URL
// var url = 'mongodb://' + process.env.IP + ':27017/aa';

