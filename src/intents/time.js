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

    //geocode the results regardless if wit provides the coords or not
    geoCode(data.location[0].value, (err, res) => {
        if (err) {
            console.log(err);
            return callback(null, `Sorry I was not able to return the time for ${data.location[0].value}`); 
        }
        if (res.status != "OK") {
            console.log(`Recieved status ${res.status} instead of OK from Google :(`);
            return callback(null, `Sorry I was not able to return the time for ${data.location[0].value}`); 
        }
    
        const results = res.results[0]; 

        request
            .get('http://api.timezonedb.com/v2/get-time-zone')
            .query({
                key: TIMEZONEDB_API_KEY,
                format: 'json',
                by: 'position',
                lat: results.geometry.location.lat,
                lng: results.geometry.location.lng
            })
            .end((err, res) => {
                if (err) {
                    console.log(err); 
                    return callback(null, `Sorry I was not able to return the time for ${data.location[0].value}`); 
                }
                if (res.statusCode != 200) {
                    console.log(`Recieved status ${res.statusCode} instead of 200 :(`);
                    return callback(null, `Sorry I was not able to return the time for ${data.location[0].value}`); 
                }

                //separate the date from the time
                let date = res.body.formatted.substr(0, 10); 
                let time = res.body.formatted.slice(11);

                let formattedTime = moment(time, 'hh:mm:ss').format('LTS');
                console.log(`formatted time: ${formattedTime}`);

                let formattedDate = moment(date, "YYYY-MM-DD").format('LL'); 
                console.log(`formatted date: ${formattedDate}`);

                return callback(false, `In ${results.formatted_address}, it is ${formattedDate} and the time is ${formattedTime}.`);
        });
    });   
}
