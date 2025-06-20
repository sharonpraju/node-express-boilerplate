const nodemailer = require("nodemailer");
const dayjs = require('dayjs');
const fs = require('fs');
const Handlebars = require('handlebars');

/**
 * Helper function to format year from date
 */
Handlebars.registerHelper('formatYear', function (date) {
  if (!date) return '';
  return new Date(date).getFullYear();
});

exports.sendEmail = async function (emails, subject, template_path, data) {
  return new Promise(async (resolve, reject) => {
    try {
      if (emails && subject && template_path && data) {
        if (typeof (emails) == 'object') emails = emails.join(", ");

        //populating template with data
        const templateSource = fs.readFileSync(template_path, 'utf8');
        const template = Handlebars.compile(templateSource);
        //Apply data to template
        const html = template(data);

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
          html: html, // html body
        });

        resolve(info);
      }
      else {
        let error_data = { date: dayjs().format("DD/MM/YYYY HH:mm"), email: emails, subject: subject, error: "Invalid parameters" }
        fs.appendFile('./logs/email-logs.txt', JSON.stringify(error_data) + "\n", (error) => { if (error) console.log(error); });
        reject("Invalid parameters");
      }
    }
    catch (error) {
      if (process.env.ENVIRONMENT == 'development') console.log(error);
      let error_data = { date: dayjs().format("DD/MM/YYYY HH:mm"), email: emails, subject: subject, error: error }
      fs.appendFile('./logs/email-logs.txt', JSON.stringify(error_data) + "\n", (error) => { if (error) console.log(error); });
      reject(false);
    }
  })
};