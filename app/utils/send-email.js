const nodemailer = require("nodemailer");
const dayjs = require('dayjs');
const fs = require('fs');

exports.sendEmail = async function (emails, subject, content, ticket) {
  return new Promise(async (resolve, reject) => {
    try {
      if (typeof (emails) == 'object') emails = emails.join(", ");
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465 ? true : false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        },
      });

      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: `"${process.env.EMAIL_USER}" <${process.env.EMAIL_USERNAME}>`, // sender address
        to: emails, // list of receivers
        subject: subject, // Subject line
        html: content, // html body
      });

      //saving sent ticket data
      if(ticket){
        let ticket_data = { ticket: ticket, status: info.messageId ? "sent" : "pending", message_id: info.messageId, date: dayjs().format("DD/MM/YYYY HH:mm"), email: emails }
        fs.appendFile('./logs/ticket-logs.txt', JSON.stringify(ticket_data) + "\n", (error) => { if (error) console.log(error); });
      }
      resolve(true);
    }
    catch (error) {
      if (process.env.ENVIRONMENT == 'development') console.log(error);
      //saving sent ticket data
      if(ticket){
        let ticket_data = { ticket: ticket, status: "failed", message_id: null, date: dayjs().format("DD/MM/YYYY HH:mm"), email: emails }
        fs.appendFile('./logs/ticket-logs.txt', JSON.stringify(ticket_data) + "\n", (error) => { if (error) console.log(error); });
      }
      let error_data = { date: dayjs().format("DD/MM/YYYY HH:mm"), email: emails, subject: subject, ticket: ticket, error: error }
      fs.appendFile('./logs/email-logs.txt', JSON.stringify(error_data) + "\n", (error) => { if (error) console.log(error); });
      reject(false);
    }
  })
};