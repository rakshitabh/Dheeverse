const nodemailer = require("nodemailer");

// Brevo SMTP Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // Port 587 uses STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Brevo SMTP Verify Error:", error);
  } else {
    console.log("✅ Brevo SMTP connected successfully");
  }
});

// Check environment variables
if (
  !process.env.SMTP_HOST ||
  !process.env.SMTP_USER ||
  !process.env.SMTP_PASS
) {
  console.error("❌ SMTP credentials are missing");
}

// Generic email sender
async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_SENDER_NAME}" <${process.env.BREVO_SENDER_EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
async function sendOTPEmail(email, otp, type = "signup") {
  const subject =
    type === "password-reset"
      ? "Password Reset OTP - DheeVerse"
      : "Verify Your Email - DheeVerse";

  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>DheeVerse</h2>

      <p>Your OTP is:</p>

      <h1 style="letter-spacing:5px; color:#4CAF50;">
        ${otp}
      </h1>

      <p>This OTP will expire in <b>10 minutes</b>.</p>

      <p>If you didn't request this email, you can ignore it.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject,
    html,
  });
}

// Welcome Email
async function sendWelcomeEmail(email, name) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>Welcome to DheeVerse, ${name}! 🎉</h2>

      <p>Your account has been created successfully.</p>

      <p>
        <a href="${process.env.FRONTEND_URL}">
          Open DheeVerse
        </a>
      </p>

      <p>Have a wonderful wellness journey 💚</p>
    </div>
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
