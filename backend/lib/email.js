const nodemailer = require('nodemailer');

console.log('=== Email Service Initialization ===');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length || 0);
console.log('EMAIL_PASS first 5 chars:', process.env.EMAIL_PASS?.substring(0, 5) || 'NOT SET');
console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

let transporter = null;
let verificationChecked = false;

async function initializeTransporter() {
  if (transporter && verificationChecked) {
    console.log('[Cache Hit] Using cached transporter');
    return transporter;
  }

  try {
    console.log('\n[Init] Creating Nodemailer transporter...');
    console.log('[Init] Service: Gmail');
    console.log('[Init] User:', process.env.EMAIL_USER);
    console.log('[Init] Pass provided:', !!process.env.EMAIL_PASS);
    
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('[Init] Transporter created, verifying SMTP connection...');
    const verified = await transporter.verify();
    console.log('[Init] ✓ SMTP connection verified:', verified);
    verificationChecked = true;
    
    return transporter;
  } catch (error) {
    console.error('[Init] ✗ Failed to initialize email transporter');
    console.error('[Init] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Init] Error message:', String(error));
    if (error instanceof Error) {
      console.error('[Init] Error code:', error.code);
      console.error('[Init] Error response:', error.response);
    }
    verificationChecked = true;
    throw error;
  }
}

async function sendEmail({ to, subject, html }) {
  console.log('\n[Email] === Sending Email ===');
  console.log('[Email] To:', to);
  console.log('[Email] Subject:', subject);
  
  try {
    console.log('[Email] Initializing transporter...');
    const transporter = await initializeTransporter();
    
    console.log('[Email] Transporter ready, sending mail...');
    const result = await transporter.sendMail({
      from: `"DheeVerse" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('[Email] ✓ Email sent successfully!');
    console.log('[Email] Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('\n[Email] ✗ Error sending email');
    console.error('[Email] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Email] Error message:', String(error));
    if (error instanceof Error) {
      console.error('[Email] Full error:', error.message);
      console.error('[Email] Error code:', error.code);
      console.error('[Email] Error response:', error.response);
      if (error.code === 'EAUTH') {
        console.error('[Email] ⚠️  AUTHENTICATION ERROR - Check your email credentials in .env');
        console.error('[Email]    Email user:', process.env.EMAIL_USER);
        console.error('[Email]    Email pass length:', process.env.EMAIL_PASS?.length || 0);
      }
    }
    throw error;
  }
}

function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('Generated OTP:', otp);
  return otp;
}

async function sendOTPEmail(email, otp, type = 'signup') {
  try {
    console.log('Preparing OTP email for:', email, 'Type:', type);
    
    const isPasswordReset = type === 'password-reset';
    const isEmailChange = type === 'email-change';
    const title = isPasswordReset
      ? 'Password Reset'
      : isEmailChange
      ? 'Confirm Email Change'
      : 'Email Verification';
    const subtitle = isPasswordReset
      ? 'Reset your DheeVerse account password'
      : isEmailChange
      ? 'Use this OTP to confirm your new email address'
      : 'Welcome to DheeVerse Wellness Journal!';
    const subject = isPasswordReset
      ? 'Password Reset OTP for DheeVerse - Expires in 10 minutes'
      : isEmailChange
      ? 'Confirm your new email - OTP expires in 10 minutes'
      : 'Your OTP for DheeVerse Wellness Journal - Expires in 10 minutes';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">DheeVerse</h1>
          <p style="margin: 5px 0 0 0;">Wellness Journal</p>
        </div>

        <h2 style="color: #333; text-align: center;">${title}</h2>
        <p style="color: #666; text-align: center;">${subtitle}</p>
        
        <p style="color: #333; margin: 30px 0 15px 0;">Your One-Time Password (OTP) is:</p>
        <div style="background-color: #f0f0f0; padding: 30px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #667eea; letter-spacing: 3px; margin: 0; font-size: 48px; font-weight: bold;">${otp}</h1>
        </div>
        
        <p style="color: #666; margin: 20px 0;">
          <strong>This OTP will expire in 10 minutes.</strong>
        </p>
        
        <p style="color: #999; font-size: 14px; margin-top: 30px;">
          If you didn't request this ${isPasswordReset ? 'password reset' : isEmailChange ? 'email change' : 'verification'}, please ignore this email and do not share this OTP with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject,
      html,
    });
    
    console.log('OTP email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw error;
  }
}

async function sendWelcomeEmail(email, name) {
  try {
    console.log('Preparing welcome email for:', email);
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center; margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 28px;">DheeVerse</h1>
          <p style="margin: 5px 0 0 0;">Wellness Journal</p>
        </div>

        <h2 style="color: #333;">Welcome to DheeVerse, ${name}!</h2>
        <p style="color: #666;">Your account has been successfully verified and created.</p>
        
        <p style="color: #333; margin: 30px 0 15px 0;">Start your wellness journey today!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/journal" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Open DheeVerse
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">
          This is an automated email. Please do not reply to this message.
        </p>
      </div>
    `;

    const result = await sendEmail({
      to: email,
      subject: 'Welcome to DheeVerse Wellness Journal!',
      html,
    });
    
    console.log('Welcome email sent successfully to:', email);
    return result;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

module.exports = {
  sendEmail,
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
};


