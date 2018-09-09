'use strict';

//loading all of the environment variables from .env file
require('dotenv').config();
const moment = require('moment'); 

module.exports = (data, callback) => {

    //ensure we get the correct intent
    if (data.intent[0].value != 'timeNow')
        return callback(new Error(`Expected timeNow intent, got ${data.intent[0].value} instead`));

    const date = `${moment().format('dddd')}, ${moment().format('LL')}`; 
    const time = moment().format('LTS');

    const message = `Today's date is ${date} and the time is ${time}.`; 
    
    return callback(false, message); 
} 
