var nodemailer = require('nodemailer');
var nconf = require('nconf');
var crypto = require('crypto');
var path = require("path");

module.exports.sendEmail = function(mailData) {
  var smtpTransport = nodemailer.createTransport("SMTP",{
    service: nconf.get('SMTP_SERVICE'),
    auth: {
      user: nconf.get('SMTP_USER'),
      pass: nconf.get('SMTP_PASS')
    }
  });
  smtpTransport.sendMail(mailData, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }
    smtpTransport.close(); // shut down the connection pool, no more messages
  });
}

// Encryption using http://dailyjs.com/2010/12/06/node-tutorial-5/
// Note: would use [password-hash](https://github.com/davidwood/node-password-hash), but we need to run
// model.query().equals(), so it's a PITA to work in their verify() function

module.exports.encryptPassword = function(password, salt) {
  return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

module.exports.makeSalt = function() {
  var len = 10;
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').substring(0, len);
}



/**
 * Load nconf and define default configuration values if config.json or ENV vars are not found
 */
module.exports.setupConfig = function(){
  nconf.argv()
    .env()
    //.file('defaults', path.join(path.resolve(__dirname, '../config.json.example')))
    .file('user', path.join(path.resolve(__dirname, '../config.json')));

//  var agent;
//  if (process.env.NODE_ENV === 'development') {
//      // Follow these instructions for profiling / debugging leaks
//      // * https://developers.google.com/chrome-developer-tools/docs/heap-profiling
//      // * https://developers.google.com/chrome-developer-tools/docs/memory-analysis-101
//      agent = require('webkit-devtools-agent');
//      console.log("To debug memory leaks:" +
//          "\n\t(1) Run `kill -SIGUSR2 " + process.pid + "`" +
//          "\n\t(2) open http://c4milo.github.com/node-webkit-agent/21.0.1180.57/inspector.html?host=localhost:1337&page=0");
//  }

  if (nconf.get('NODE_ENV') === "development") {
    Error.stackTraceLimit = Infinity;
  }
};


module.exports.errorHandler = function(err, req, res, next) {
  // when we hit an error, send it to admin as an email. If no ADMIN_EMAIL is present, just send it to yourself (SMTP_USER)
  var stack = (err.stack ? err.stack : err.message ? err.message : err) +
    "\n ----------------------------\n" +
    "\n\noriginalUrl: " + req.originalUrl +
    "\n\nauth: " + req.headers['x-api-user'] + ' | ' + req.headers['x-api-key'] +
    "\n\nheaders: " + JSON.stringify(req.headers) +
    "\n\nbody: " + JSON.stringify(req.body);
  module.exports.sendEmail({
    from: "HabitRPG <" + nconf.get('SMTP_USER') + ">",
    to: nconf.get('ADMIN_EMAIL') || nconf.get('SMTP_USER'),
    subject: "HabitRPG Error",
    text: stack
  });
  console.error(stack);
  var shortMessage =  (err.message.length < 200) ? err.message :
    err.message.substring(0,100) + err.message.substring(err.message.length-100,err.message.length);
  res.json(500,{err:shortMessage}); //res.end(err.message);
}