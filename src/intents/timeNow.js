'use strict';

//loading all of the environment variables from .env file
require('dotenv').config();
const moment = require('moment'); 

module.exports = (data, callback) => {

    //ensure we get the correct intent
    if (data.intent[0].value != 'time-now' && data.intent[0].value != 'timeNow')
        return callback(new Error(`Expected time-now/timeNow intent, got ${data.intent[0].value} instead`));

    const time = moment().format('LTS'); 
    const message = `The time right now is ${time}.`; 
    return callback(false, message); 
} 