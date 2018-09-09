'use strict'; 

const request = require('superagent'); 

const WIT_SERVER_ACCESS_TOKEN = process.env.WIT_SERVER_ACCESS_TOKEN;
    
if (!WIT_SERVER_ACCESS_TOKEN)
    throw new Error("Missing WIT_SERVER_ACCESS_TOKEN"); 

module.exports = (message, callback) => { 

    request
        .get('https://api.wit.ai/message')
        .set('Authorization', 'Bearer ' + WIT_SERVER_ACCESS_TOKEN)
        .query({
            v: '20180908'
        })
        .query({
            q: message
        })
        .end((err, res) => { 
            if (err)
                return callback(err); 
        if (res.statusCode != 200)
            return callback(`Recieved status ${res.statusCode} instead of 200 :(`);

        return callback(null, res.body.entities);  
    });  
}
