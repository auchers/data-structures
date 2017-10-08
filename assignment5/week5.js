var fs = require('fs');

var dbName = 'aa';
var collName = 'meetings';

// Connection URL
var url = 'mongodb://' + process.env.IP + ':27017/' + dbName;

// Retrieve
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect(url, function(err, db) {
    if (err) {return console.dir(err);}

    var collection = db.collection(collName);
    
    // quick reference for mongo queries: https://docs.mongodb.com/manual/meta/aggregation-quick-reference/
    // aaron also mentioned 'unwind' as a way to get in embedded parts of documents (essentially it 'flattens' them)
    // GOAL : all meetings in your zone that begin on Tuesdays at or after 7:00pm
    var my_query = [// we ran multiple queries -- to test each on just uncomment the part with the '{'
        
        { $match : {"meetingTimes.day" : "Tuesdays"} },
        { $unwind :  "$meetingTimes"},
        { $match : {"meetingTimes.day" : "Tuesdays"} }, 
        { $match : {"meetingTimes.from.0": { $gte : 19 } } }
        // { $match : {"hour" : { $gte : 19 } } }
        
    
        // QUERY 1
        // taken from https://docs.mongodb.com/manual/reference/operator/aggregation/match/#pipe._S_match
        // { $match : {"statusValue": "In Service"} }, 
        // { $match : { availableDocks : { $lt : 1 } } }, // looking for 0 available docks
        
        // QUERY 2
        // average operator only available in 'group stage'
        // for now, not interested in grouping, but we're gonna do a fake group in order to use it
        // { $group: {_id : null, avgBikes : { $avg : "$availableBikes" } } }

        // QUERY 3
        // now group by status value    
        // outputs 2 documents -- one for each value of "statusValue"
        // { $group : { _id : "$statusValue", avgBikes : { $avg : "$availableBikes" } } }
        
        // QUERY 4
        // push moves values on to the next stage
        // when you run this one you will see that all the station names are passed along as an array
        // { $group : { _id : "$statusValue", statName : { $push : "$stationName" } } }
        
        // QUERY 5 -- how do you find all the bikes that are east of 14th street?
        ];
    
    collection.aggregate(my_query).toArray(function(err, docs) {
        if (err) {console.log(err)}
        
        else {
            console.log("Writing", docs.length, "documents as a result of this aggregation.");
            fs.writeFileSync('mongo_aggregation_result.JSON', JSON.stringify(docs, null, 4));
        }
        db.close();
        
    });

}); //MongoClient.connect