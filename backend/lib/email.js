const fetch = require("node-fetch");

const API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail({ to, subject, html }) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo API Error:", data);
    throw new Error(data.message || "Failed to send email");
  }

  console.log("✅ Email sent successfully");

  return data;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, type = "signup") {
  const subject =
    type === "password-reset"
      ? "Password Reset OTP - DheeVerse"
      : "Verify Your Email - DheeVerse";

  const html = `
      <h2>DheeVerse</h2>

      <p>Your OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP expires in 10 minutes.</p>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

async function sendWelcomeEmail(email, name) {
  return sendEmail({
    to: email,
    subject: "Welcome to DheeVerse",
    html: `
        <h2>Welcome ${name}!</h2>

        <p>Your account has been created successfully.</p>

        <a href="${process.env.FRONTEND_URL}">
            Open DheeVerse
        </a>
    `,
  });
}

module.exports = {
  sendEmail,
  generateOTP,
 sendOTPEmail,
  sendWelcomeEmail,
};