var request = require('request');
var async = require('async');
var fs = require('fs');
var cheerio = require('cheerio');
var content = fs.readFileSync('../assignment2/m04.txt');

// SETTING ENVIRONMENT VARIABLES (in Linux):
// export NEW_VAR="Content of NEW_VAR variable"
// printenv | grep NEW_VAR
var apiKey = process.env.GMAKEY;

// initialization
var $ = cheerio.load(content);
var addresses = [];
var meetingsData = [];

scrapeAndCleanAddresses($);
async.eachOfSeries(addresses, getAndPushGeos, saveMeetingsData);

function scrapeAndCleanAddresses($){
    //select the third table and then iterate through its rows
    $('table').eq(2).find('tbody tr').each(function(i, elem) {
        var address = $(elem).find('td')
                            .eq(0) // first cell in each row
                            .contents() //get all the cell contents
                            .eq(6) //select the 6th one
                            .text()
                            .split(',')[0]
                            .split(' - ')[0] // removes all the room numbers
                            .trim();
        addresses.push(address  + ', New York, NY');
    });
}

function getAndPushGeos(address, i, callback){
    // console.log('address ' + i + ' is: ' + address);
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address.split(' ').join('+') + '&key=' + apiKey;
    var thisMeeting = new Object;
    thisMeeting.address = address;

    request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            thisMeeting.latLong = JSON.parse(body).results[0].geometry.location;
            meetingsData.push(thisMeeting);
    });

    setTimeout(callback,2000);
}

function saveMeetingsData(){
    // console.log(meetingsData.length);
    fs.writeFileSync('/home/ubuntu/workspace/assignment3/meetingsData.txt',JSON.stringify(meetingsData, null, 2));
}
