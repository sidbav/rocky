'use strict';
//loading all of the environment variables from .env file
require('dotenv').config();

const request = require('superagent');

//importing API Key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY)
    throw new Error("Missing GOOGLE_MAPS_API_KEY");

module.exports.geoCode = (location, callback) => {
    
    request
        .get('https://maps.googleapis.com/maps/api/geocode/json')
        .query({
            key: GOOGLE_MAPS_API_KEY,
            address: location
        })
        .end((err, res) => { 
            if (err) { 
                return callback(err); 
            }
            if (res.statusCode != 200|| res.body.status != "OK")
                return callback(`Received status code ${res.statusCode}/${res.body.status} instead of 200/OK`); 
            
            return callback(false, res.body); 
        }); 
}
