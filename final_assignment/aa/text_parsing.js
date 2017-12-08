var request = require('request');
var async = require('async');
var fs = require('fs');
var cheerio = require('cheerio');

// File Names
var files = ['m01','m02','m03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10'];

// Addresses that needed to be fixed manually for the google API
var addressFixMapping = {
    "189th+Street+&+Bennett+Avenue,+New+York,+NY": "Bennett+Avenue+&+189th+Street,+New+York,+NY",
    "Central+Park+West+&+76th+Street,+New+York,+NY": "West+76th+Street+&+Central+Park,+New+York,+NY"
};

// Get API key from environment variable
var apiKey = process.env.GMAKEY;

/* Go through files and parse them */
/* doing it this way to add a timeout between each file processing so as to
* not overload google api*/
// initialize first file index
var f = 0;
loopThroughFiles();

/////////// Function Defs ///////////////
function loopThroughFiles(){
    setTimeout(function(){
        let path = files[f];
        console.log(path);
        parseFile(path);

        // iterate f to get to next file
        f++;
        if (f<files.length)
            loopThroughFiles(); // invokes next file after waiting 1 sec delay
    }, 1000);
}

function parseFile(path){
    let meetingsArray = [];
    let $ = cheerio.load(fs.readFileSync(`data/${path}.txt`));

    //iterate through table rows and parse information
    $('table').eq(2).find('tbody tr').each(function(i, elem) {

        // each row is a new meeting -- create new meeting object
        let thisMeeting = {};

        let cell1 = $(elem).find('td').eq(0);
        let cell2 = $(elem).find('td').eq(1);

        // NAME AND LOCATION
        // get Location and event name
        thisMeeting.eventName = cell1.find('b').text().trim();
        if (cell1.find('h4').text() !== '')
            thisMeeting.locationName = cell1.find('h4').text();

        // get details
        if (cell1.find('div').hasClass('detailsBox'))
            thisMeeting.details = cell1.find('div').text().trim();

        // get wheelchair access
        thisMeeting.hasWheelchairAccess = (cell1.find('span').length !== 0);

        // ADDRESSES
        let address = {};
        address.fullAddress = cell1.contents().eq(6).text().trim();
        address.streetAddress = address.fullAddress
            .split(',')[0]
            .split(' - ')[0] // removes all the room numbers
            .replace(/(<([^>]+)>)/ig, '')
            .trim();

        address.streetAddress += ', New York, NY';
        thisMeeting.address = address;

        // MEETING TIMES
        thisMeeting.meetingTimes = getMeetingTimes(cell2);

        // push meeting object
        meetingsArray.push(thisMeeting);
    });

    console.log('finished parsing file: '+ path);

    // geocode each meeting
    async.eachOfSeries(meetingsArray, getGeos, function(){
        console.log(`saving file: ${path}`);
        fs.writeFileSync('data/parsed_' +  path + '.json',JSON.stringify(meetingsArray, null, 1));
    });
}

function getMeetingTimes(cell2){
    let meetingTimes = [];

    // split all the meeting times
    let split = cell2.html().split('\n                    \t\n\t\t\t\t  \t');

    // Iterate through all meeting times
    for (m in split){
        // splits the date off from the misc information like 'Meeting Type' and 'Special Interest'
        [date, misc, misc2] = split[m].trim().split('<br>');
        date = date.replace(/(<([^>]+)>)/ig, '').trim(); // clean up date

        // splits day and times
        [day, times] = date.split(' From ');

        // splits beginning time from end time
        [from, to] = times.split('to').map(function(x){

                // separate hour from part of day (pod)
                [t, pod] = x.trim().split(' ');

                // separate hours and minutes
                [hour, min] = t.split(':');

                //change hour to 24 hour clock
                hour = (pod === 'PM' && hour < 12) ? +hour + 12 : +hour;

                return {hour: hour, min: +min};
        });

        // create thisTime object
        let thisTime = {
            full: date,
            day: day,
            from: from,
            to: to
        };

        // add in extras: Meeting Type and Special Interest
        let meetingType, specialInterest;
        let extras = [misc, misc2]; // sometimes they come in different orders so generalize over them
        for (e in extras){
            if (extras[e].includes('Meeting Type'))
                meetingType = extras[e].split('/b> ')[1].trim();
            else if (extras[e].includes('Special Interest'))
                specialInterest = extras[e].split('/b> ')[1].trim();
        }
        if (meetingType) thisTime.meetingType = meetingType;
        if (specialInterest) thisTime.specialInterest = specialInterest;

        // push thisTime into array
        meetingTimes.push(thisTime);
    }
    return meetingTimes;
}

function getGeos(meeting, i, callback){
    let address = meeting.address.streetAddress.split(' ').join('+');

    // check to see if one of addresses is problematic and replace it with fixed version
    address = (address in addressFixMapping)? addressFixMapping[address] : address;

    var apiRequest = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + apiKey;

    request(apiRequest, function(err, resp, body) {
        if (err) {throw err;}

        // keep going if one comes back with status = 'UNKNOWN ERROR'
        if (JSON.parse(body).status === 'OK'){

            // check to see if returned google formatted address is in NY to catch mistakes
            if (!JSON.parse(body).results[0].formatted_address.includes('New York, NY')){
                console.log('NOT IN NY!: ', JSON.parse(body).results[0].formatted_address);
                console.log('request: ', apiRequest);
            }

            // add latLong to meeting object
            meeting.address.latLong = JSON.parse(body).results[0].geometry.location;
        }
    });

    setTimeout(callback,500);
}

// problem addresses
//https://maps.googleapis.com/maps/api/geocode/json?address=189th+Street+&+Bennett+Avenue,+New+York,+NY&key=AIzaSyDbDWfv3LS1JBIDoVAmQSQ8oQtAVVs1jBk
//https://maps.googleapis.com/maps/api/geocode/json?address=Central+Park+West+&+76th+Street,+New+York,+NY&key=AIzaSyDbDWfv3LS1JBIDoVAmQSQ8oQtAVVs1jBk
