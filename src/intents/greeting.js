'use strict'; 

module.exports = (data, callback) => { 
    
    //ensure we get the correct intent
    if (data.intent[0].value != 'greeting')
        return callback(new Error(`Expected greeting intent, got ${data.intent[0].value} instead`));
    
    
    var message = ''; 

    const hellos = ['Greetings! ', 'Howdy! ', 'Hi! ']; 

    const hrur = ['I am great. ', 'I am tired. ', '', 'I am doing well. ', 'I am good. ', 'I am cold as a rock. ', 'I am rock solid. ']; 
    
    const hru = ['How are you?', 'How are you doing?', 'How is it going?', 'What up?', 'What\'s up?', 'How ya doing?']; 
    
    message += hellos[Math.floor(Math.random()*hellos.length)]; 
    message += hrur[Math.floor(Math.random()* hrur.length)]; 
    message += hru[Math.floor(Math.random() * hru.length)]; 

    callback(false, message); 
}