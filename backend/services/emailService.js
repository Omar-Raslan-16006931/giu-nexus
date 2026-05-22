const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text }) => {
  const info = await transporter.sendMail({
    from: `"GIU Nexus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
  console.log("Email sent:", info.messageId);
};

module.exports = sendEmail;