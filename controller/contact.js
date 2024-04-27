var nodemailer = require('nodemailer');

function sendContact(email, phone, info, cv,recaptchaError) {
    if (!recaptchaError) {
        if (email && phone) {
            const transporter = nodemailer.createTransport({
                port: 587,               // true for 465, false for other ports
                host: process.env.MAILHOST,
                auth: {
                    user: process.env.MAILUSER,
                    pass: process.env.MAILPASS,
                },
                secure: false,
                tls: {
                    ciphers: 'SSLv3'
                }
            });

            const data = null;

            if (cv) data = cv.data;

            const mailData = {
                from: 'ap7456@gmail.com',  // sender address
                to: 'ag007125@gmail.com',   // list of receivers
                subject: 'Sending Email using Node.js',
                text: 'That was easy!',
                html: `<b>Hola! </b>  <br>  ${email} con numero ${phone} quiere ser doctor. Mas info ${info}<br/> `,
                attachments: [
                    {
                        filename: 'curriculum.pdf',
                        content: data
                    },
                ]
            };

            return new Promise((resolve, reject) => {
                transporter.sendMail(mailData, function (err, info) {
                    if (err) {
                        console.log(err);
                        resolve(err)
                    }
                    else {
                        console.log(info);
                        resolve('Correo enviado')
                    }
                });
            });

        } else {
            return "Campo obligatorio"
        }
    }
    else {
        return "Error en captcha"
    }

}

module.exports = {
    sendContact
};