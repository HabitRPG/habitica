var forever = require('forever-monitor');
var child = new (forever.Monitor)('forever.js');

child.on('stdout', notifyAdmin); // FIXME on('error') and on('stderr') aren't working
child.on('exit', function () {
    var err = 'server.js has exited after 10 restarts';
    console.log(err);
    notifyAdmin(err);
});
child.start();

function notifyAdmin(err){
    var nodemailer = require("derby-auth/node_modules/nodemailer");
    var smtpTransport = nodemailer.createTransport("SMTP",{
        service: process.env.SMTP_SERVICE || 'Gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
    var mailData = {
        from: "HabitRPG <admin@habitrpg.com>",
        to: 'tylerrenelle@gmail.com',
        subject: "HabitRPG Error",
        text: err
    }

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
