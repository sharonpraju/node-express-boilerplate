//AccountSID and Auth Token from console.twilio.com
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = require('twilio')(accountSid, authToken);
const dayjs = require('dayjs');

exports.sendOTP = async function (phone, otp) {
  return new Promise(async (resolve, reject) => {
    try {
      client.messages
        .create({
          body: `Your OTP for Cashtha is ${otp}`,
          to: phone,
          from: process.env.TWILIO_NUMBER,
        })
        .then((message) => resolve(true))
        .catch((error) => {
          let error_data = { date: dayjs().format("DD/MM/YYYY HH:mm"), receiver: phone, data: otp, error: error }
          fs.appendFile('./logs/sms-logs.txt', JSON.stringify(error_data) + "\n", (error) => { if (error) console.log(error); });
          reject(error);
        });
    }
    catch (error) {
      console.log(error);
      reject(false);
    }
  })
};