'use strict';

module.exports = (data, callback) => {

    //ensure we get the correcr intent
    if (data.intent[0].value != 'time')
        return callback(new Error(`Expected time intent, got ${data.intent[0].value} instead`));

    //did not recieve the location with time intent
    if (!data.location)
        return callback(new Error(`Missing location with the time intent`));

    return callback(null, `I do not yet know how to return the time in ${data.location[0].value}`);
}