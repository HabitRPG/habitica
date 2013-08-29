var nconf = require('nconf');

process.on("uncaughtException", function(error) {
  var sendEmail;
  sendEmail = function(mailData) {
    var nodemailer, smtpTransport;
    nodemailer = require("derby-auth/node_modules/nodemailer");
    /* create reusable transport method (opens pool of SMTP connections)*/

    /* TODO derby-auth isn't currently configurable here, if you need customizations please send pull request*/

    smtpTransport = nodemailer.createTransport("SMTP", {
      service: nconf.get('SMTP_SERVICE'),
      auth: {
        user: nconf.get('SMTP_USER'),
        pass: nconf.get('SMTP_PASS')
      }
    });
    /* send mail with defined transport object*/

    return smtpTransport.sendMail(mailData, function(error, response) {
      if (error) {
        console.log(error);
      } else {
        console.log("Message sent: " + response.message);
      }
      /* shut down the connection pool, no more messages*/

      return smtpTransport.close();
    });
  };
  sendEmail({
    from: "HabitRPG <admin@habitrpg.com>",
    to: "tylerrenelle@gmail.com",
    subject: "HabitRPG Error",
    text: error.stack
  });
  return console.log(error.stack);
});