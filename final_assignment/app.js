var express = require('express'),
    app = express();
var fs = require('fs');

// Postgres
const { Pool } = require('pg');
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_USER;
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'sensors';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

// Mongo
var collName = 'meetings';
var MongoClient = require('mongodb').MongoClient;
var url = process.env.ATLAS;

// HTML wrappers for AA data
var index1 = fs.readFileSync("index1.txt");
var index3 = fs.readFileSync("index3.txt");

app.get('/', function(req, res) {
    // Connect to the AWS RDS Postgres database
    const client = new Pool(db_credentials);

    // SQL query
    var q = `WITH lag_hall AS (
            SELECT x, y, z, 
                    (a.time AT TIME ZONE 'UTC') as ny_time, 
                    abs(x-lag(x) over (order by a.time asc)) x_diff,
                    abs(y-lag(y) over (order by a.time asc)) y_diff,
                    abs(z-lag(z) over (order by a.time asc)) z_diff, 
                    is_magnetized,
                    lag(is_magnetized) over (order by a.time asc) as prev_value
                from accelerometer a
                join hall h on h.time = a.time
                ),
            door_events as (
                SELECT *,
                    (CASE WHEN (not is_magnetized) and prev_value then 1 else 0 end) as opening_door,
                    (CASE WHEN is_magnetized and (not prev_value) then 1 else 0 end) as closing_door,
                    lag(ny_time) over (order by ny_time asc),
                    EXTRACT(EPOCH FROM (ny_time - lag(ny_time) over (order by ny_time asc))) as duration
                FROM lag_hall
                where 
                (((not is_magnetized) and prev_value) or (is_magnetized and (not prev_value)))
            ),
            day_aggregate as (
                SELECT DATE_TRUNC('hour', ny_time) as hour, 
                    count(case when closing_door = 1 and duration < 60 then 1 end) as fridge_door_opening_cnt,
                    count(case when closing_door = 1 and duration >= 60 then 1 end) as cat_shenanigan_cnt
                FROM door_events
                group by 1
            )
            SELECT  *
            FROM day_aggregate
            ORDER by day desc;`;

    client.connect();
    client.query(q, (qerr, qres) => {
        res.send(qres.rows);
        console.log('responded to request');
    });
    client.end();
});

app.get('/aa', function(req, res) {

    MongoClient.connect(url, function(err, db) {
        if (err) {return console.dir(err);}
        var daysOfWeek =
            ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];

        var dateTimeNow = new Date();
        var todayNum = dateTimeNow.getDay();
        var today = daysOfWeek[todayNum];
        var tomorrowNum;
        if (today === 6) {tomorrowNum = 0;} // loop back to Sunday at the end of the week
        else {tomorrowNum = today + 1}
        var tomorrow = daysOfWeek[tomorrowNum];
        var hour = dateTimeNow.getHours();

        console.log('today:', today, hour);

        var collection = db.collection(collName);

        collection.aggregate([ // start of aggregation pipeline

        //     // match by day and time
            { $unwind :  "$meetingTimes"},
            { $match :
                { $or : [
                    { $and: [
                        { "meetingTimes.day" : today } , { "meetingTimes.from.hour" : { $gte: hour } }
                    ]},
                    { $and: [
                        { "meetingTimes.day" : tomorrow } , { "meetingTimes.from.hour" : { $lte: 4 } }
                    ]}
                ]}
            },
        //     // group by meeting group
            { $group : { _id : {
                latLong : "$address.latLong",
                meetingName : "$eventName",
                meetingAddress : "$address.fullAddress",
                meetingDetails : "$details",
                meetingWheelchair : "$hasWheelchairAccess",
            },
                meetingTime : { $push : "$meetingTimes.full" },
                meetingType : { $push : "$meetingTimes.meetingType" }
            }
            },
        //
            // group meeting groups by latLong
            {
                $group : { _id : {
                    latLong : "$_id.latLong"},
                    meetingGroups : { $push : {groupInfo : "$_id", meetingTime : "$meetingTime", meetingType : "$meetingType" }}
                }
            }

        ]).toArray(function(err, docs) { // end of aggregation pipeline
            if (err) {console.log(err)}

            else {
                res.writeHead(200, {'content-type': 'text/html'});
                res.write(index1);
                res.write(JSON.stringify(docs));
                res.end(index3);
            }
            db.close();
        });
    });

});

// app.listen(process.env.PORT, function() {
app.listen(4000, function() {
    console.log('Server listening...');
});