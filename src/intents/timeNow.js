'use strict';

//loading all of the environment variables from .env file
require('dotenv').config();


module.exports = (data, callback) => {

    //ensure we get the correct intent
    if (data.intent[0].value != 'time-now')
        return callback(new Error(`Expected time-now intent, got ${data.intent[0].value} instead`));
} 