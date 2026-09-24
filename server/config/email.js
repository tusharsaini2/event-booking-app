const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

console.log('Transporter type:', typeof transporter);
console.log('Has sendMail:', typeof transporter.sendMail);

module.exports = transporter;