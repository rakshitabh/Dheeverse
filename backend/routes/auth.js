const express = require('express');
const router = express.Router();
const { connectToDatabase } = require('../lib/mongodb');
const User = require('../lib/models/User');
const OTP = require('../lib/models/OTP');
const { sendOTPEmail, generateOTP, sendWelcomeEmail } = require('../lib/email');
const { generateToken } = require('../lib/auth-middleware');

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received');
    
    await connectToDatabase();
    console.log('Database connected successfully');

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user and check password
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create response with user data (excluding password)
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    // Generate JWT token
    const token = generateToken(user._id.toString());

    console.log('Login successful for user:', email);

    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

// Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('=== Signup Request Started ===');
    
    const { email, password } = req.body;
    console.log('Signup data received - Email:', email);

    // Validation
    if (!email || !password) {
      console.log('Validation failed: missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      console.log('Validation failed: password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    // Normalize email (lowercase and trim) - User schema also does this, but do it here for consistency
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists (User schema already normalizes to lowercase)
    console.log('Checking if user already exists...');
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      console.log('User already exists:', normalizedEmail);
      return res.status(409).json({ 
        error: 'Email already registered',
        message: 'This email address is already registered. Please use a different email or try logging in.'
      });
    }

    // Create user with normalized email
    console.log('Creating new user...');
    const user = new User({
      email: normalizedEmail, // Use normalized email
      password,
      name: normalizedEmail.split('@')[0],
    });

    console.log('Saving user to database...');
    await user.save();
    console.log('User saved successfully with ID:', user._id);

    // Generate and save OTP
    console.log('Generating OTP...');
    const otp = generateOTP();
    console.log('OTP generated:', otp);
    
    await OTP.deleteMany({ email });
    console.log('Old OTPs deleted');
    
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log('OTP saved to database');

    // Send OTP email - non-blocking
    console.log('Sending OTP email...');
    let emailSent = false;
    let emailError = null;

    try {
      await sendOTPEmail(email, otp);
      emailSent = true;
      console.log('OTP email sent successfully');
    } catch (emailErr) {
      emailError = emailErr;
      console.error('Failed to send OTP email:', emailErr);
    }

    // Return success regardless of email status
    if (emailSent) {
      console.log('Signup completed successfully with email sent');
      return res.status(201).json({
        message: 'User registered successfully. OTP sent to email.',
        userId: user._id,
        email: user.email,
      });
    } else {
      console.log('Signup completed but email failed - returning partial success');
      return res.status(201).json({
        message: 'User created but OTP email could not be sent. Please check your email configuration and try resending OTP.',
        userId: user._id,
        email: user.email,
        emailError: String(emailError),
      });
    }
  } catch (error) {
    console.error('=== Signup Error ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', String(error));
    
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: String(error),
    });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    console.log('OTP verification request received');
    
    await connectToDatabase();
    console.log('Database connected for OTP verification');

    const { email, otp } = req.body;
    console.log('Verifying OTP for email:', email);

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find and verify OTP (only signup type for email verification)
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'signup',
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpRecord) {
      console.log('OTP not found or expired for:', email);
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    console.log('OTP verified successfully');

    // Send welcome email
    try {
      const name = email.split('@')[0];
      await sendWelcomeEmail(email, name);
      console.log('Welcome email sent');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    return res.status(200).json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Forgot password request received');
    
    await connectToDatabase();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists (don't reveal if email doesn't exist for security)
    const user = await User.findOne({ email });
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.status(200).json({ 
        message: 'If the email exists, a password reset OTP has been sent.' 
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email, type: 'password-reset' });

    // Generate new OTP
    const otp = generateOTP();
    
    await OTP.create({
      email,
      otp,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, 'password-reset');
      console.log('Password reset OTP email sent successfully');
    } catch (emailError) {
      console.error('Failed to send password reset OTP email:', emailError);
      return res.status(500).json({
        error: 'Failed to send OTP email. Please try again later.'
      });
    }

    return res.status(200).json({ 
      message: 'If the email exists, a password reset OTP has been sent.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

// Reset Password - Verify OTP and set new password
router.post('/reset-password', async (req, res) => {
  try {
    console.log('Reset password request received');
    
    await connectToDatabase();
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'~`]/.test(newPassword);

    let strength = 0;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    // Require at least 3 of 4 criteria for medium/strong passwords
    if (strength < 3) {
      return res.status(400).json({ 
        error: 'Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters' 
      });
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'password-reset',
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Mark OTP as verified and delete it
    otpRecord.verified = true;
    await otpRecord.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    console.log('Password reset successful for:', email);

    return res.status(200).json({
      message: 'Password reset successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    console.log('Resend OTP request received');
    
    await connectToDatabase();
    console.log('Database connected for OTP resend');

    const { email } = req.body;
    console.log('Resending OTP for email:', email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Delete old OTPs (only signup type)
    await OTP.deleteMany({ email, type: 'signup' });
    console.log('Old OTPs deleted');

    // Generate new OTP
    const otp = generateOTP();
    console.log('New OTP generated');
    
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log('New OTP saved to database');

    // Send OTP email
    try {
      await sendOTPEmail(email, otp);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      return res.status(500).json({
        error: 'Failed to send OTP email. Please check your email configuration.'
      });
    }

    return res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return res.status(500).json({ error: 'Internal server error', details: String(error) });
  }
});

module.exports = router;


