var nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USERNAME || "1a2b3c4d5e6f7g", //generated by Mailtrap
    pass: process.env.MAIL_PASSWORD || "1a2b3c4d5e6f7g", //generated by Mailtrap
  },
});
module.exports = transport;