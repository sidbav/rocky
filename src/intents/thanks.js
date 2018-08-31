'use strict'; 

module.exports = (data, callback) => { 
    
    //ensure we get the correct intent
    if (data.intent[0].value != 'thanks')
        return callback(new Error(`Expected greeting intent, got ${data.intent[0].value} instead`));
    
    const messages = ['No problem.', 'My Pleasure.', 'You\'re Welcome.', 'No Worries.', 'You are Welcome.', 'Forget it.', 'It\'s nothing.']; 
    
    const message = messages[Math.floor(Math.random()*messages.length)];

    callback(false, message); 

}