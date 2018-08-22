module.exports = (app) => {
    
    //loading all of the environment variables from .env file
    require('dotenv').config(); 
    
    const slackEventsApi = require('@slack/events-api'),
        SlackClient = require('@slack/client').WebClient,
        passport = require('passport'),
        SlackStrategy = require('@aoberoi/passport-slack').default.Strategy; //used when authentacting with passport

    //connecting to slack app
    const slackEvents = slackEventsApi.createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
        includeBody: true
    });
    
    //setting up bot (sidbav_bot)
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
        clientID: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        skipUserProfile: true,
    },
        (accessToken, scopes, team, extra, profiles, done) => {
        botAuthorizations[team.id] = extra.bot.accessToken;
        done(null, {});
    }));


    app.use(passport.initialize());

    app.get('/', (req, res) => {
        res.send('<a href="/auth/slack"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>');
    });

    app.get('/auth/slack', passport.authenticate('slack', {
        scope: ['bot']
    }));

    app.get('/auth/slack/callback',
        passport.authenticate('slack', { session: false }), (req, res) => {   
            res.send('<p>sidbav_bot was successfully installed on your team.</p>');
    },
    (err, req, res, next) => {
        res.status(500).send(`<p>sidbav_bot failed to install</p> <pre>${err}</pre>`);
    }
    );  

    //express middleware stuff
    app.use('/slack/events', slackEvents.expressMiddleware());

    // *** Greeting any user that says "hi" ***
    slackEvents.on('message', (message, body) => {

    if (!message.subtype && message.text.indexOf('hi') >= 0) {

        const slack = getClientByTeamId(body.team_id);

        if (!slack) {
            return console.error('No authorization found for this team. Did you install this app again after restarting?');
        }

        slack.chat.postMessage({ channel: message.channel, text: `Hello <@${message.user}>! :tada:` })
            .catch(console.error);
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