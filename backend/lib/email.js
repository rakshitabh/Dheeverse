const nodemailer = require('nodemailer');

// Gmail SMTP Configuration
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: false, // true for 465, false for other ports like 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,
});

transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Verify Error:", error);
  } else {
    console.log("SMTP Server is ready");
  }
});

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error("❌ Gmail SMTP credentials are missing in .env file");
}

async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"DheeVerse" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: html,
    });

    console.log("✅ Email sent via Gmail SMTP:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Gmail SMTP email failed:", error.message);
    throw error;
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, type = "signup") {
  const subject =
    type === "password-reset"
      ? "Password Reset OTP – DheeVerse"
      : "Your OTP for DheeVerse – Expires in 10 minutes";

  const html = `
    <h2>DheeVerse</h2>
    <p>Your OTP is:</p>
    <h1>${otp}</h1>
    <p>This OTP expires in 10 minutes.</p>
  `;

  return sendEmail({ to: email, subject, html });
}

async function sendWelcomeEmail(email, name) {
  const html = `
    <h2>Welcome to DheeVerse, ${name}!</h2>
    <p>Your account has been created successfully.</p>
    <a href="${process.env.FRONTEND_URL}">Open App</a>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to DheeVerse",
    html,
  });
}

module.exports = {
  sendEmail,
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};
