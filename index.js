const logger = require('morgan'); 
const express = require('express'); 
const app = express(); 
const PORT = process.env.PORT || 4000;

//morgan setup to log all requests
app.use(logger('dev'));

//slack file
require('./slack/slack')(app); 

//start the server
app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});