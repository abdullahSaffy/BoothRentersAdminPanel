const handlebars = require('handlebars');
const sendgrid = require('@sendgrid/mail');


sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = function (type, params) {
    return new Promise(async (resolve, reject) => {
        let html = "";
        let template = "";
        let replacements = {};
        let htmlToSend = "";
        let mail = "";
        switch (type) {
            case "ResetPassword":
                html = await FUNC.readHTMLFile('./public/email-template/reset-password.html');
                template = handlebars.compile(html);
                replacements = {
                    username: params.fullName,
                    otp: params.otp,
                    webLink: process.env.SITE_URL
                };
                htmlToSend = template(replacements);
                mail = {
                    from: process.env.FROM_MAIL,
                    to: params.to,
                    subject: DM.RESET_PASSWORD,
                    html: htmlToSend,
                }
                sendgrid.send(
                    mail,
                    function (error, response) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }
                    });
                break;
        }
    })

}

module.exports = sendMail;