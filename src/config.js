/* Load nconf and define default configuration values if config.json or ENV vars are not found*/


var conf = require("nconf");
var path = require("path");
var utils = require("./utils")

module.exports.setup = function(){
  conf.argv()
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

  if (conf.get('NODE_ENV') === "development") {
    Error.stackTraceLimit = Infinity;
  }
};


module.exports.errorHandler = function(err, req, res, next) {
  // when we hit an error, send it to admin as an email. If no ADMIN_EMAIL is present, just send it to yourself (SMTP_USER)
  var stack = (err.stack ? err.stack : err.message ? err.message : err) +
    "\n ----------------------------\n" +
    "\nauth: " + req.headers['x-api-user'] + ' | ' + req.headers['x-api-key'] +
    "\noriginalUrl: " + req.originalUrl +
    "\nbody: " + JSON.stringify(req.body);
  utils.sendEmail({
    from: "HabitRPG <" + conf.get('SMTP_USER') + ">",
    to: conf.get('ADMIN_EMAIL') || conf.get('SMTP_USER'),
    subject: "HabitRPG Error",
    text: stack
  });
  console.error(stack);
  var shortMessage =  (err.message.length < 200) ? err.message :
    err.message.substring(0,100) + err.message.substring(err.message.length-100,err.message.length);
  res.json(500,{err:shortMessage}); //res.end(err.message);
}