'use strict';
const nodemailer = require('nodemailer');

class Email{
    static sendMail(){


        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'xyz@gmail.com',
                pass: '*************'
            }
        });

        let mailDetails = {
            from: 'xyz@gmail.com',
            to: 'abc@gmail.com',
            subject: 'Test mail',
            text: 'Node.js testing mail for GeeksforGeeks'
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });
    }
}

module.exports = Email
