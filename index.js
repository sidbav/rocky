'use strict'; 
const logger = require('morgan'); 
const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 4000;
//loading all of the environment variables from .env file
require('dotenv').config(); 

//morgan setup to log all requests
app.use(logger('dev'));

//slack file
require('./src/slackClient')(app); 

//wit 
require('./src/witClient')(app); 

//start the server
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT} in ${app.get('env')} mode`);
});