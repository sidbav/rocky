'use strict';
const request = require('superagent');  

module.exports = (data, callback) => { 
    
    //ensure we get the correct intent
    if (data.intent[0].value != 'joke')
        return callback(new Error(`Expected joke intent, got ${data.intent[0].value} instead`));
    
    request 
        .get('https://08ad1pao69.execute-api.us-east-1.amazonaws.com/dev/random_joke')
        .end((err, res) => { 
            if (err) { 
                console.log(err); 
                return callback(false, `Hmm for some reason I can't get a joke, but I can tell you a rock joke! \
                Where do rocks like to go to sleep? BedRocks!`); 
            }
            if (res.status != 200) { 
                console.log(`Did not get res.status 200, got this instead ${res.status}`); 
                return callback(false, `Hmm for some reason I can't get a joke, but I can tell you a rock joke! \
                Where do rocks like to go to sleep? Bedrocks!`); 
            }
            const set = res.body.setup; 
            const punch = res.body.punchline; 
            const message = `${set} ${punch}`; 
            return callback(false, message);  
        });     

}