'use strict'; 

//loading all of the environment variables from .env file
require('dotenv').config();

const request = require('superagent'); 
const geoCode = require('../googleClient'.geoCode); 

const OPEN_WEATHER_MAP_API = process.env.OPEN_WEATHER_MAP_API
if (!OPEN_WEATHER_MAP_API) { 
    throw new Error('Missing OPEN_WEATHER_MAP_API'); 
}

module.exports = (data, callback) => { 
    //ensure we get the correct intent
    if (data.intent[0].value != 'weather')
        return callback(new Error(`Expected weather intent, got ${data.intent[0].value} instead`));

    //did not recieve the location with weather intent
    if (!data.location)
        return callback(new Error(`Missing location with the weather intent`));


    geoCode(data.location[0].value, (err, res) => {
        if (err) {
            return callback(err);
        }
        if (res.status != "OK")
            return callback(`Recieved status ${res.status} instead of OK from Google :(`);
        
        const results = res.results[0]; 

        request
            .get('http://api.openweathermap.org/data/2.5/weather')
            .query({
                appid: OPEN_WEATHER_MAP_API,
                units: 'metric',
                lat: results.geometry.location.lat, 
                lon: results.geometry.location.lng 
            })
            .end((err, res) => { 
                if (err)
                    return callback(err); 
                if (res.status != 200)
                    return callback(res.status); 
                
                let des = res.body.weather.description; 
                let temp = res.body.main.temp; 

                return callback(false, `The current weather in ${results.formatted_address} is ${des} at ${temp} degrees celsius`)
        }); 
    }); 
    
}

