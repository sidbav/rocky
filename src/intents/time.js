'use strict';

//loading all of the environment variables from .env file
require('dotenv').config();

const request = require('superagent');
const moment = require('moment'); 

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

    const lat = data.location[0].resolved.values[0].coords.lat;
    console.log('lat is ' + lat); 
    const long = data.location[0].resolved.values[0].coords.long;

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
            if (res.statusCode != 200 ||res.body.status != "OK") { 
                return callback(`Recieved status ${res.body.status} or ${res.statusCode} instead of OK/200 :(`);
            } 
            //separate the date from the time
            let time = res.body.formatted.slice(11); 
            console.log(time); 

            let formattedTime = moment(time, 'hh:mm:ss').format('LTS'); 
            console.log(`time: ${formattedTime}`); 

            return callback(false, `The time in ${data.location[0].value} is ${formattedTime}.`); 
    });
}
