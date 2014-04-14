// mailer.js 
// Use nodemailer as module
var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: "nompweb@gmail.com",
        pass: "nompwebadmin"
    }
});

// setup e-mail data with unicode symbols
/*
    Full exemple of an option
    var mailOptions = {
        from: "NOMP Web <no-reply@nompweb.com>", // sender address
        to: "hys@gmail.com, yipeng.huang@utt.fr", // list of receivers
        subject: "Hello", // Subject line
        text: "Hello world", // plaintext body
        html: "<b>Hello world</b>" // html body
    }
 */

exports.smtpTransport = smtpTransport;
/*
    Exemple of sendMail function
    smtpTransport.sendMail(mailOptions, function(error, response) {
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }

        // if you don't want to use this transport object anymore, uncomment following line
        //smtpTransport.close(); // shut down the connection pool, no more messages
    });
 */