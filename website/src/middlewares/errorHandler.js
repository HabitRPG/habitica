var logging = require('../libs/logging');

module.exports = function(err, req, res, next) {
  //res.locals.domain.emit('error', err);
  // when we hit an error, send it to admin as an email. If no ADMIN_EMAIL is present, just send it to yourself (SMTP_USER)
  var stack = (err.stack ? err.stack : err.message ? err.message : err) +
    "\n ----------------------------\n" +
    "\n\noriginalUrl: " + req.originalUrl +
    "\n\nauth: " + req.headers['x-api-user'] + ' | ' + req.headers['x-api-key'] +
    "\n\nheaders: " + JSON.stringify(req.headers) +
    "\n\nbody: " + JSON.stringify(req.body) +
    (res.locals.ops ? "\n\ncompleted ops: " + JSON.stringify(res.locals.ops) : "");
  logging.error(stack);
  /*logging.loggly({
    error: "Uncaught error",
    stack: (err.stack || err.message || err),
    body: req.body, headers: req.header,
    auth: req.headers['x-api-user'],
    originalUrl: req.originalUrl
  });*/
  var message = err.message ? err.message : err;
  message =  (message.length < 200) ? message : message.substring(0,100) + message.substring(message.length-100,message.length);
  res.json(500,{err:message}); //res.end(err.message);
};
