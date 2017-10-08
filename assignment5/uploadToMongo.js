var request = require('request');
var fs = require('fs');
var content = fs.readFileSync('../assignment5/meetingsData.json');

// IN MONGO exists a database `citibike` with a collection `stations`
var dbName = 'aa'; // name of Mongo database (created in the Mongo shell)
var collName = 'meetings'; // name of Mongo collection (created in the Mongo shell)

loadToMongo(content);

function loadToMongo (body) {
        var meetingData = JSON.parse(body);
        
        // Connection URL
        var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;
        
        // Retrieve
        var MongoClient = require('mongodb').MongoClient; 
        
        MongoClient.connect(url, function(err, db) {
            if (err) {return console.dir(err);}
        
            var collection = db.collection(collName);
        
            // THIS IS WHERE THE DOCUMENT(S) IS/ARE INSERTED TO MONGO:
            collection.insert(meetingData);
            db.close();
    }); //MongoClient.connect
}