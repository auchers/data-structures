
var request = require('request');
const { Client } = require('pg');

// PARTICLE PHOTON
var device_id = process.env.PHOTON_ID;
var access_token = process.env.PHOTON_TOKEN;
var particle_variable = 'values';
var device_url = 'https://api.particle.io/v1/devices/' + device_id + '/' + particle_variable + '?access_token=' + access_token;

// AWS RDS POSTGRESQL INSTANCE
var db_credentials = new Object();
db_credentials.user = process.env.AWSRDS_USER;
db_credentials.host = process.env.AWSRDS_EP;
db_credentials.database = 'sensors';
db_credentials.password = process.env.AWSRDS_PW;
db_credentials.port = 5432;
console.log(device_url);
console.log(db_credentials);

var getAndWriteData = function() {
    // Make request to the Particle API to get sensor values
    request(device_url, function(error, response, body) {
        // Store sensor values in variables
        let device_json_string = JSON.parse(body).result;
        let x = JSON.parse(device_json_string).x;
        let y = JSON.parse(device_json_string).y;
        let z = JSON.parse(device_json_string).z;
        let hall = JSON.parse(device_json_string).hall;

        // // Connect to the AWS RDS Postgres database
        const client = new Client(db_credentials);
        client.connect((err) => {
            if (err) {
                console.error('connection error', err.stack)
            } else {
                console.log('connected')
            }
        });

        // Construct a SQL statement to insert sensor values into a table
        let thisQuery = `INSERT INTO accelerometer VALUES (${x}, ${y}, ${z}, DEFAULT); 
            INSERT INTO hall VALUES (${hall} :: BOOLEAN, DEFAULT);`;

        console.log(thisQuery); // for debugging

        // Connect to the AWS RDS Postgres database and insert a new row of sensor values
        client.query(thisQuery, (err, res) => {
            if (err) throw (err);
            console.log(res);
            client.end();
        });
    });
};

// write a new row of sensor data every five minutes
setInterval(getAndWriteData, 1000);