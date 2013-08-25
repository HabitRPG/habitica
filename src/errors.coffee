nconf = require('nconf')

process.on "uncaughtException", (error) ->
  sendEmail = (mailData) ->
    nodemailer = require("derby-auth/node_modules/nodemailer")

    # create reusable transport method (opens pool of SMTP connections)
    # TODO derby-auth isn't currently configurable here, if you need customizations please send pull request
    smtpTransport = nodemailer.createTransport("SMTP",
      service: nconf.get('SMTP_SERVICE')
      auth:
        user: nconf.get('SMTP_USER')
        pass: nconf.get('SMTP_PASS')
    )

    # send mail with defined transport object
    smtpTransport.sendMail mailData, (error, response) ->
      if error
        console.log error
      else
        console.log "Message sent: " + response.message
      smtpTransport.close() # shut down the connection pool, no more messages

  sendEmail
    from: "HabitRPG <admin@habitrpg.com>"
    to: "tylerrenelle@gmail.com"
    subject: "HabitRPG Error"
    text: error.stack

  console.log error.stack