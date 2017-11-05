var express = require('express'),
    app = express();
const { Pool } = require('pg');

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_USER;
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'sensors';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;

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
                SELECT DATE_TRUNC('day', ny_time) as day, 
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

app.listen(3000, function() {
    console.log('Server listening...');
});