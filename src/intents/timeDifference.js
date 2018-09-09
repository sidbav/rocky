'use strict'; 

//loading all of the environment variables from .env file
require('dotenv').config();
const moment = require('moment'); 

const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;

if (!TIMEZONEDB_API_KEY)
    throw new Error(`Missing TIMEZONEDB_API_KEY`);

const request = require('superagent'); 
const geoCode = require('../googleClient').geoCode; 
const func = require('./functions/timeDifferenceFunctions'); 

module.exports = (data, callback) => { 
    //ensure we get the correct intent
    if (data.intent[0].value != 'timeDifference')
        return callback(new Error(`Expected timeDifference intent, got ${data.intent[0].value} instead`));

    //did not recieve the location with timeDifference intent
    if (!data.location)
        return callback(new Error(`Missing location with the time difference intent`)); 

    //only provide one location or if one location is here, and the other is an actually place (hopefully lol)
    if (data.location.length == 1 || data.location[0].value.toLowerCase() == 'here' ||data.location[1].value.toLowerCase() == 'here') { 
        
        //var loc; 

        if (data.location[0].value.toLowerCase() == 'here') { 
            console.log(`changed the value of data.location[0].value`)
            data.location[0].value = data.location[1].value; 
        }
        //console.log(loc); 

        geoCode(data.location[0].value, (err, res) => {
            if (err) {
                console.log(err); 
                return callback(false, `Sorry, I had a problem finding out the time difference betweeen ${data.location[0].value} and here.`);
            }
            if (res.status != "OK") {
                console.log(`Recieved status ${res.status} instead of OK from Google :(`);
                return callback(false, `Sorry, I had a problem finding out the time difference betweeen ${data.location[0].value} and here.`);
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
                        return callback(false, `Sorry, I had a problem finding out the time difference betweeen ${data.location[0].value} and here.`);
                    }
                    if (res.statusCode != 200) {
                        console.log(`Recieved status ${res.statusCode} instead of 200 :(`);
                        return callback(false, `Sorry, I had a problem finding out the time difference betweeen ${data.location[0].value} and here.`);
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
                        return callback(false, func.noDiff2(results.formatted_address, date, time)); 
                    }
                    else if (diff < 0) { 
                        return callback(false, func.ahead2(results.formatted_address,
                            Math.abs(diff), formattedDateThere, formattedTimeThere, date, time));
                    }
                    else { 
                        return callback(false, func.behind2(results.formatted_address,
                            Math.abs(diff), formattedDateThere, formattedTimeThere, date, time));
                    }
            });
        });   
    }
    //provide two locations
    else { 
        geoCode(data.location[0].value, (err, res) => {
            if (err) {
                console.log(err);
                return callback(false, func.prob(data.location[0].value, data.location[1].value));
            }
            if (res.status != "OK") {
                console.log(`Recieved status ${res.status} instead of OK from Google :(`);
                return callback(false, func.prob(data.location[0].value, data.location[1].value));
            } 

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
                        console.log(err);
                        return callback(false, func.prob(data.location[0].value, data.location[1].value));
                    }
                    if (res.statusCode != 200) {
                        console.log(`Recieved status ${res.statusCode} instead of 200 :(`);
                        return callback(false, func.prob(data.location[0].value, data.location[1].value));
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
                            console.log(error);
                        }
                        if (response.status != "OK") {
                            console.log(`Recieved status ${response.status} instead of OK from Google :(`);
                            return callback(false, func.prob(data.location[0].value, data.location[1].value));
                        }

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
                                    console.log(error);
                                    return callback(false, func.prob(data.location[0].value, data.location[1].value));
                                }
                                if (response.statusCode != 200) {
                                    console.log(`Recieved status ${response.statusCode} instead of 200 :(`);
                                    return callback(false, func.prob(data.location[0].value, data.location[1].value));
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
                                    return callback(false, func.noDiff(result0.formatted_address, result1.formatted_address,
                                        formattedDate1, formattedTime0)); 
                                }
                                else if (diff > 0) { 
                                    return callback(false, func.ahead(result0.formatted_address, result1.formatted_address,
                                                            Math.abs(diff), formattedDate0, formattedTime0, formattedDate1, formattedTime1));  
                                }
                                else { 
                                    return callback(false, func.behind(result0.formatted_address, result1.formatted_address,
                                        Math.abs(diff), formattedDate0, formattedTime0, formattedDate1, formattedTime1)); 
                                }
                        });
                    });   
            });
        });  
    }

}
