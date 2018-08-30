'use strict'; 

    //loading all of the environment variables from .env file
    require('dotenv').config(); 
    
    const slackEventsApi = require('@slack/events-api'),
        SlackClient = require('@slack/client').WebClient,
        passport = require('passport'),
        SlackStrategy = require('@aoberoi/passport-slack').default.Strategy, //used when authentacting with passport
        nlp = require('./witClient'); 
    
    //all of the tokens with error checking
    const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET; 

    if (!SLACK_SIGNING_SECRET)
        throw new Error('missing SLACK_SIGNING_SECRET'); 

    const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID; 

    if (!SLACK_CLIENT_ID)
        throw new Error('missing SLACK_CLIENT_ID'); 

    const SLACK_CLIENT_SECRET=  process.env.SLACK_CLIENT_SECRET; 
    
    if (!SLACK_CLIENT_SECRET)
        throw new Error('missing SLACK_CLIENT_SECRET');    
        
module.exports = (app) => {

    //connecting to slack app
    const slackEvents = slackEventsApi.createEventAdapter(SLACK_SIGNING_SECRET, {
        includeBody: true
    });

    const botAuthorizations = {}    
    const clients = {};

    function getClientByTeamId(teamId) {
        if (!clients[teamId] && botAuthorizations[teamId]) {
            clients[teamId] = new SlackClient(botAuthorizations[teamId]);
        }
        if (clients[teamId]) {
            return clients[teamId];
        }
        return null;
    }

    passport.use(new SlackStrategy({
        clientID: SLACK_CLIENT_ID,
        clientSecret: SLACK_CLIENT_SECRET,
        skipUserProfile: true,
    },
        (accessToken, scopes, team, extra, profiles, done) => {
        botAuthorizations[team.id] = extra.bot.accessToken;
        done(null, {});
    }));

    //all of the express functions 
    app.use(passport.initialize());

    app.get('/', (req, res) => {
        res.send('<a href="/auth/slack"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
    });

    app.get('/auth/slack', passport.authenticate('slack', {
        scope: ['bot']
    }));

    app.get('/auth/slack/callback',
        passport.authenticate('slack', { session: false }), (req, res) => {   
            res.send('<p>Rocky was successfully installed on your team.</p>');
        },
        (err, req, res, next) => {
        res.status(500).send(`<p>Rocky failed to install</p> <pre>${err}</pre>`);
        }
    );  

    //express middleware stuff
    app.use('/slack/events', slackEvents.expressMiddleware());

    //what happens when any message is sent
    slackEvents.on('message', (message, body) => {

        console.log(message.text); 

        //check message to see if it has rocky in the message, else we will not respond
        if (message.text.toLowerCase().includes('rocky')|| message.text.includes('<@UCAMDFK89>')) {

            var string = ''; 
            //remove bot user id if referred to as @rocky
            if (message.text.includes('<@UCAMDFK89>')) 
                string = message.text.replace(/<@UCAMDFK89>/gi,'');
            else if (message.text.toLowerCase().includes('rocky'))
                string = message.text.replace(/rocky/gi,'');  
            
            //ensure slack connection is made before interpreting the message
            const slack = getClientByTeamId(body.team_id);
            if (!slack) 
                return console.error('No authorization found for this team. Did you install this app again after restarting?');
            
            nlp(string, (err, res) => { 
                if (err) { 
                    console.log(err); 
                    return; 
                }

                try { 
                    //if any errors with the intents
                    if (!res.intent || !res.intent[0] || !res.intent[0].value)
                        throw new Error("Could not extract intent.");
                    var intent;

                    //may need to rename the folder
                    if (res.intent[0].value === 'time-now') { 
                        intent = require(`./intents/timeNow`); 
                    } 
                    else {                     
                        intent = require(`./intents/${res.intent[0].value}`);
                    }       
                    intent(res, (error, response) => { 
                        if(error) {
                            console.log(error.message);
                            return;
                        }

                        return slack.chat.postMessage({ channel: message.channel, text: response })
                            .catch(console.error);                
                    }); 
                } 
                catch (err) {
                    console.log(err);
                    console.log(res);
                    return slack.chat.postMessage({ channel: message.channel, text: `Sorry I do not understand. Right now I am still working on getting the time for certain cities, but dont worry that will be fized soon!` })
                            .catch(console.error);     
                }             
            }); 
        }
    });

    // *** Handle errors ***
    slackEvents.on('error', (error) => {
        if (error.code === slackEventsApi.errorCodes.TOKEN_VERIFICATION_FAILURE) {
        // This error type also has a `body` propery containing the request body which failed verification.
            console.error(`An unverified request was sent to the Slack events Request URL. Request body: \
        ${JSON.stringify(error.body)}`);
        } 
        else {
        console.error(`An error occurred while handling a Slack event: ${error.message}`);  
        }
    });
}    
