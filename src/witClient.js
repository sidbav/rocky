'use strict'; 

const request = require('superagent'); 

const token = process.env.WIT_SERVER_ACCESS_TOKEN;
    
if (!token)
    throw new Error("Missing WIT_SERVER_ACCESS_TOKEN"); 

module.exports = (message, callback) => { 

    request
        .get('https://api.wit.ai/message')
        .set('Authorization', 'Bearer ' + token)
        .query({
            v: '20180830'
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
