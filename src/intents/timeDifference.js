'use strict'; 

//loading all of the environment variables from .env file
require('dotenv').config();
const moment = require('moment'); 

const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;

if (!TIMEZONEDB_API_KEY)
    throw new Error(`Missing TIMEZONEDB_API_KEY`);

const request = require('superagent'); 
const geoCode = require('../googleClient').geoCode; 

module.exports = (data, callback) => { 
    //ensure we get the correct intent
    if (data.intent[0].value != 'timeDifference')
        return callback(new Error(`Expected timeDifference intent, got ${data.intent[0].value} instead`));

    //did not recieve the location with time intent
    if (!data.location)
        return callback(new Error(`Missing location with the time intent`)); 

    //only provide one location or if one location is here, and the other is an actually place (hopefully lol)
    if (data.location.length == 1 || data.location[0].value.toLowerCase() == 'here' ||data.location[1].value.toLowerCase() == 'here') { 

        geoCode(data.location[0].value, (err, res) => {
            if (err) {
                return callback(err);
            }
            if (res.status != "OK")
                return callback(`Recieved status ${res.status} instead of OK from Google :(`);
            
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
                        return callback(err);
                    }
                    if (res.statusCode != 200) {
                        return callback(`Recieved status ${res.statusCode} instead of 200 :(`);
                    }
                    //there
                    const dateThere = res.body.formatted.substr(0, 10); 
                    const timeThere = res.body.formatted.slice(11);
                    const timeThereCom = moment(timeThere, "HH:mm:ss"); 
                    const formattedTimeThere = moment(timeThere, 'hh:mm:ss').format('LTS');
                    console.log(`formatted time: ${formattedTimeThere}`);
                    const formattedDateThere = `${moment(dateThere, "YYYY-MM-DD").format('dddd')}, ${moment(dateThere, "YYYY-MM-DD").format('LL')}`; 
                    console.log(`formatted date: ${formattedDateThere}`);
                    
                    //here
                    const timeHere = moment();
                    const date = `${moment().format('dddd')}, ${moment().format('LL')}`; 
                    const time = moment().format('LTS');

                    //return negative if timeHere is ahead, and positive if timeHere is behind
                    const diff = Math.round(timeHere.diff(timeThereCom, 'hours', true)*10)/10;

                    if (diff == 0) { 
                        return callback(false, `There is no difference in time betweeen ${results.formatted_address} and here. Today's date here and in ${results.formatted_address} is ${date} and the time is ${time}.`); 
                    }
                    else if (diff < 0) { 
                        return callback(false, `${results.formatted_address} is ahead of here by ${Math.abs(diff)} hours. In ${results.formatted_address}, it is ${formattedDateThere} and the time is ${formattedTimeThere}. Here the date is ${date} and the time is ${time}.`)
                    }
                    else { 
                        return callback(false, `${results.formatted_address} is behind of here by ${Math.abs(diff)} hours. In ${results.formatted_address}, it is ${formattedDateThere} and the time is ${formattedTimeThere}. Here the date is ${date} and the time is ${time}.`)
                    }
            });
        });   
    }
    //provide two locations
    else { 
        geoCode(data.location[0].value, (err, res) => {
            if (err) {
                return callback(err);
            }
            if (res.status != "OK")
                return callback(`Recieved status ${res.status} instead of OK from Google :(`);
            
            const result0 = res.results[0]; 
            request
                .get('http://api.timezonedb.com/v2/get-time-zone')
                .query({
                    key: TIMEZONEDB_API_KEY,
                    format: 'json',
                    by: 'position',
                    lat: result0.geometry.location.lat,
                    lng: result0.geometry.location.lng
                })
                .end((err, res) => {
                    if (err) {
                        return callback(err);
                    }
                    if (res.statusCode != 200) {
                        return callback(`Recieved status ${res.statusCode} instead of 200 :(`);
                    }

                    //location 0 info
                    const date0 = res.body.formatted.substr(0, 10); 
                    const time0 = res.body.formatted.slice(11);
                    const time0Com = moment(time0, "HH:mm:ss"); 
                    const formattedTime0= moment(time0, 'hh:mm:ss').format('LTS');
                    console.log(`formatted time0: ${formattedTime0}`);
                    const formattedDate0= `${moment(date0, "YYYY-MM-DD").format('dddd')}, ${moment(date0, "YYYY-MM-DD").format('LL')}`; 
                    console.log(`formatted date0: ${formattedDate0}`);
                    
                    //now get the other location's stuff
                    geoCode(data.location[1].value, (error, response) => {
                        if (error) {
                            return callback(error);
                        }
                        if (response.status != "OK")
                            return callback(`Recieved status ${response.status} instead of OK from Google :(`);
                        
                        const result1 = response.results[0]; 
                        request
                            .get('http://api.timezonedb.com/v2/get-time-zone')
                            .query({
                                key: TIMEZONEDB_API_KEY,
                                format: 'json',
                                by: 'position',
                                lat: result1.geometry.location.lat,
                                lng: result1.geometry.location.lng
                            })
                            .end((error, response) => {
                                if (error) {
                                    return callback(error);
                                }
                                if (response.statusCode != 200) {
                                    return callback(`Recieved status ${response.statusCode} instead of 200 :(`);
                                }

                                //location 1 info
                                const date1 = response.body.formatted.substr(0, 10); 
                                const time1 = response.body.formatted.slice(11);
                                const time1Com = moment(time1, "HH:mm:ss"); 
                                const formattedTime1 = moment(time1, 'hh:mm:ss').format('LTS');
                                console.log(`formatted time1: ${formattedTime1}`);
                                const formattedDate1= `${moment(date1, "YYYY-MM-DD").format('dddd')}, ${moment(date1, "YYYY-MM-DD").format('LL')}`; 
                                console.log(`formatted date1: ${formattedDate1}`);
                    

                                //return negative if time0Com is behind, and positive if time0Com is ahead
                                const diff = Math.round(time0Com.diff(time1Com, 'hours', true) * 10)/10;

                                if (diff == 0) { 
                                    return callback(false, `There is no difference in time betweeen ${result0.formatted_address}
                                    and ${result1.formatted_address}.Today's date ${result0.formatted_address} and 
                                    ${result1.formatted_address}is ${formatteDate1} and the time is ${formattedDate0}.`); 
                                }
                                //do not change this it is correct 
                                else if (diff > 0) { 
                                    return callback(false, `${result0.formatted_address} is *ahead* of ${result1.formatted_address} by ${Math.abs(diff)} hours. In ${result0.formatted_address}, it is ${formattedDate0} and the time is ${formattedTime0}. In ${result1.formatted_address}, it is ${formattedDate1} and the time is ${formattedTime1}.`); 
                                }
                                else { 
                                    return callback(false, `${result0.formatted_address} is *behind* of ${result1.formatted_address} by ${Math.abs(diff)} hours. In ${result0.formatted_address}, it is ${formattedDate0} and the time is ${formattedTime0}. In ${result1.formatted_address}, it is ${formattedDate1} and the time is ${formattedTime1}.`); 
                                }
                        });
                    });   
            });
        });  
    }

}