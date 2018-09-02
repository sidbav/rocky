'use strict'; 

module.exports = (data, callback) => { 
    //ensure we get the correct intent
    if (data.intent[0].value != 'bye')
        return callback(new Error(`Expected bye intent, got ${data.intent[0].value} instead`));
    
    const byes = ['See you later aligator!', 'Bye', 'talk to you tommorrow', 'Goodbye', 'later', 'Bye-bye']; 

    const message = byes[Math.floor(Math.random() * byes.length)]; 

    return callback(false, message); 

}