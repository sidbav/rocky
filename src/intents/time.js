'use strict';

//loading all of the environment variables from .env file
require('dotenv').config();

const request = require('superagent');
const moment = require('moment');

//needed if Wit does not provide the long and lat for a location
const geoCode = require('../googleClient').geoCode;

const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;

if (!TIMEZONEDB_API_KEY)
    throw new Error(`Missing TIMEZONEDB_API_KEY`);

module.exports = (data, callback) => {

    //ensure we get the correct intent
    if (data.intent[0].value != 'time')
        return callback(new Error(`Expected time intent, got ${data.intent[0].value} instead`));

    //did not recieve the location with time intent
    if (!data.location)
        return callback(new Error(`Missing location with the time intent`));

    var lat;
    var long;
    var googleData;  
    function googleResponse(res) { 
        googleData = res;
        console.log(`Google Data: ${googleData}`) 
        return; 
    } 
    //check to see if we need to use google geoCoding or not
    if (!data.location[0].resolved) {

        console.log(`using Google geocoding`);

        geoCode(data.location[0].value, (err, res) => {
            if (err) {
                return callback(err);
            }
            //set long and lat to the search results
            lat = res.geometry.location.lat;
            long = res.geometry.location.lng;
            console.log(lat +" google"); 
            console.log(long + "google"); 
            googleResponse(res); 
        });
    }
    else {
        console.log(`Did not use google Geocoding`)
        lat = data.location[0].resolved.values[0].coords.lat;
        long = data.location[0].resolved.values[0].coords.long;
    }

    request
        .get('http://api.timezonedb.com/v2/get-time-zone')
        .query({
            key: TIMEZONEDB_API_KEY,
            format: 'json',
            by: 'position',
            lat: lat,
            lng: long
        })
        .end((err, res) => {
            if (err) {
                return callback(err);
            }
            if (res.statusCode != 200 || res.body.status != "OK") {
                return callback(`Recieved status ${res.body.status} or ${res.statusCode} instead of OK/200 :(`);
            }

            // console.log(res); 
            //separate the date from the time
            let time = res.body.formatted.slice(11);
            console.log(`the time is ${time}`);

            let formattedTime = moment(time, 'hh:mm:ss').format('LTS');
            console.log(`formatted time: ${formattedTime}`);

            return callback(false, `The time in ${data.location[0].value} is ${formattedTime}.`);
        });
}
