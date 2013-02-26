// Load nconf and define default configuration values if config.json or ENV vars are not found
var conf = require('nconf');
conf.argv().env().file({ file: __dirname + "/config.json" }).defaults({
   'PORT': 3000,
   'IP': '0.0.0.0'
});

// Override normal ENV values with nconf ENV values (ENV values are used the same way without nconf)
process.env.IP = conf.get("IP");
process.env.PORT = conf.get("PORT");
process.env.BASE_URL = conf.get("BASE_URL");
process.env.FACEBOOK_KEY = conf.get("FACEBOOK_KEY");
process.env.FACEBOOK_SECRET = conf.get("FACEBOOK_SECRET");
process.env.NODE_DB_URI = conf.get("NODE_DB_URI");
process.env.NODE_ENV = conf.get("NODE_ENV");
process.env.SESSION_SECRET = conf.get("SESSION_SECRET");
process.env.SMTP_USER = conf.get("SMTP_USER");
process.env.SMTP_PASS = conf.get("SMTP_PASS");
process.env.SMTP_SERVICE = conf.get("SMTP_SERVICE");
process.env.STRIPE_API_KEY = conf.get("STRIPE_API_KEY");
process.env.STRIPE_PUB_KEY = conf.get("STRIPE_PUB_KEY");

var agent;
if (process.env.NODE_ENV === 'development') {
    // Follow these instructions for profiling / debugging leaks
    // * https://developers.google.com/chrome-developer-tools/docs/heap-profiling
    // * https://developers.google.com/chrome-developer-tools/docs/memory-analysis-101
    agent = require('webkit-devtools-agent');
    console.log("To debug memory leaks:" +
        "\n\t(1) Run `kill -SIGUSR2 " + process.pid + "`" +
        "\n\t(2) open http://c4milo.github.com/node-webkit-agent/21.0.1180.57/inspector.html?host=localhost:1337&page=0");
}

process.on('uncaughtException', function (error) {

    function sendEmail(mailData) {
        var nodemailer = require("derby-auth/node_modules/nodemailer");

        // create reusable transport method (opens pool of SMTP connections)
        // TODO derby-auth isn't currently configurable here, if you need customizations please send pull request
        var smtpTransport = nodemailer.createTransport("SMTP",{
            service: process.env.SMTP_SERVICE,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // send mail with defined transport object
        smtpTransport.sendMail(mailData, function(error, response){
            if(error){
                console.log(error);
            }else{
                console.log("Message sent: " + response.message);
            }

            smtpTransport.close(); // shut down the connection pool, no more messages
        });
    }

    sendEmail({
        from: "HabitRPG <admin@habitrpg.com>",
        to: "tylerrenelle@gmail.com",
        subject: "HabitRPG Error",
        text: error.stack
    });
    console.log(error.stack);
});

require('coffee-script') // remove intermediate compilation requirement
require('./src/server').listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0');

// Note: removed "up" module, which is default for development (but interferes with and production + PaaS)
// Restore to 5310bb0 if I want it back (see https://github.com/codeparty/derby/issues/165#issuecomment-10405693)
