'use strict'; 

module.exports = (data, callback) => { 
    
    //ensure we get the correct intent
    if (data.intent[0].value != 'greeting')
        return callback(new Error(`Expected greeting intent, got ${data.intent[0].value} instead`));
    
    
    var message = ''; 

    const hellos = ['Greetings! ', 'Howdy! ', 'Hi! ']; 
    const hru = ['I am great. ', 'I am tired. ', 'I am stonecold. ', 'I am doing well. ', 'I am good. ', 'I am cold as a rock. ', 'I am rock solid. ']; 

    message += hellos[Math.floor(Math.random()*hellos.length)]; 
    message += hru[Math.floor(Math.random()* hru.length)]; 
    message += 'How are you?'; 

    callback(false, message); 




}