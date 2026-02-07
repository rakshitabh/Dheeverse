const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const SENDER_NAME = process.env.BREVO_SENDER_NAME || "DheeVerse";

if (!BREVO_API_KEY) {
  console.error("❌ BREVO_API_KEY is missing");
}

async function sendEmail({ to, subject, html }) {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: SENDER_EMAIL,
          name: SENDER_NAME,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo error response:", data);
      throw new Error(data.message || "Brevo email failed");
    }

    console.log("✅ Email sent via Brevo:", data.messageId);
    return data;
  } catch (error) {
    console.error("❌ Brevo email failed:", error.message);
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
