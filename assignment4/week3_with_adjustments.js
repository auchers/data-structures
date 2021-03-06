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
var meetingsData = [];

scrapeAndCleanMeetingData($);
async.eachOfSeries(meetingsData, getAndPushGeos, saveMeetingsData);

function scrapeAndCleanMeetingData($){
    //select the third table and then iterate through its rows
    $('table').eq(2).find('tbody tr').each(function(i, elem) {
        var thisMeeting = new Object;
        var thisAddress = new Object;
        var meetingTimes = [];

        // get first cell in each row
        var firstCell = $(elem).find('td').eq(0);

        // get location/name
        thisMeeting.eventName = firstCell.find('b').text();
        if (firstCell.find('h4').text() != ''){
            thisMeeting.locationName = firstCell.find('h4').text();
        }

        // get details
        if (firstCell.find('div').hasClass('detailsBox')){ thisMeeting.details = firstCell.find('div').text().trim()}

        // get wheelchair access
        thisMeeting.hasWheelchairAccess = (firstCell.find('span').length != 0);

        // get addresses
        thisAddress.fullAddress = firstCell
                                .contents() //get all the cell contents
                                .eq(6) //select the 6th one
                                .text()
                                .trim();

        thisAddress.streetAddress = thisAddress.fullAddress
                                    .split(',')[0]
                                    .split(' - ')[0] // removes all the room numbers
                                    .trim();

        thisAddress.streetAddress  += ', New York, NY';

        // get meeting times
        var meetingTimesRaw = $(elem).find('td').eq(1).html().split('\n\t\t\t \t\t\t<br>\n                    \t<br>\n                    \t\n\t\t\t\t  \t');
        for (var m in meetingTimesRaw){
            var thisTime = new Object();
            thisTime.time = meetingTimesRaw[m].split('Type')[0].trim();
            
            if (typeof meetingTimesRaw[m].split('Type')[1] != 'undefined'){
                thisTime.type = meetingTimesRaw[m].split('Type')[1].split('Special Interest')[0].trim();
            
                if (typeof meetingTimesRaw[m].split('Type')[1].split('Special Interest')[1] != 'undefined'){
                    thisTime.specialInterest = meetingTimesRaw[m].split('Type')[1].split('Special Interest')[1].trim();
                }
            }
            meetingTimes.push(thisTime);
        }

        // push meeting
        thisMeeting.meetingTimes = meetingTimes;
        thisMeeting.address = thisAddress;

        // console.log(thisMeeting);

        meetingsData.push(thisMeeting);
    });
}

function getAndPushGeos(meeting, i, callback){
    var address = meeting.address.streetAddress;
    console.log('address ' + i + ' is: ' + address);
    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address.split(' ').join('+') + '&key=' + apiKey;
    console.log(apiRequest);

    request(apiRequest, function(err, resp, body) {
            if (err) {throw err;}
            console.log(JSON.parse(body).status);
            
            // keep going if one comes back with status = 'UNKNOWN ERROR'
            if (JSON.parse(body).status == 'OK'){
                meeting.address.latLong = JSON.parse(body).results[0].geometry.location;
            }
    });

    setTimeout(callback,500);
}

function saveMeetingsData(){
    console.log(meetingsData.length);
    fs.writeFileSync('/home/ubuntu/workspace/assignment4/meetingsData.json',JSON.stringify(meetingsData, null, 1));
}
