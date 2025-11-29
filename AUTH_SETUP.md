# DheeVerse Wellness Journal - Authentication Setup Guide

## Overview
The application now includes a complete authentication system with MongoDB integration and email-based OTP verification using Nodemailer.

## Configuration

### 1. MongoDB Setup
Update your `.env.local` file with your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness-journal
```

Get your connection string from:
1. MongoDB Atlas Dashboard (https://www.mongodb.com/cloud/atlas)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string and add your password

### 2. Email Setup (Nodemailer)
Configure your email service in `.env.local`:

```env
# Gmail Setup (Recommended)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Gmail Configuration Steps:
1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Google will generate a 16-character password
5. Use this password in `EMAIL_PASS`

#### Other Email Services:
For other providers (Outlook, Yahoo, etc.), update `EMAIL_SERVICE` accordingly:
```env
EMAIL_SERVICE=outlook  # or yahoo, aol, etc.
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

### 3. App Configuration
Set your app URL for email links:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Models

### User Model (`lib/models/User.ts`)
- **email**: Unique email address (required, indexed)
- **password**: Hashed with bcryptjs (required, min 6 characters)
- **name**: User's name (default: email prefix)
- **avatar**: User's profile picture URL (optional)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

Features:
- Automatic password hashing on save
- Password comparison method for authentication
- Unique email constraint

### OTP Model (`lib/models/OTP.ts`)
- **email**: Email address for OTP (required)
- **otp**: 6-digit OTP code (required)
- **expiresAt**: Expiration timestamp (10 minutes)
- **verified**: Boolean flag for verification status
- **createdAt**: Timestamp

Features:
- Automatic deletion of expired OTPs (TTL index)
- Prevents reuse of verified OTPs

## API Endpoints

### POST `/api/auth/signup`
Register a new user and send OTP email.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. OTP sent to email.",
  "userId": "user_id_here"
}
```

### POST `/api/auth/verify-otp`
Verify OTP and complete signup.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

### POST `/api/auth/login`
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "name": "user",
    "avatar": null,
    "createdAt": "2025-11-28T00:00:00.000Z",
    "updatedAt": "2025-11-28T00:00:00.000Z"
  }
}
```

### POST `/api/auth/resend-otp`
Resend OTP email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to email"
}
```

## Email Templates

### OTP Email
- Professional HTML template
- 6-digit OTP in large, centered text
- 10-minute expiration notice
- Security warning

### Welcome Email
- Personalized greeting
- Account activation confirmation
- Direct link to app
- Branded footer

## Security Features

1. **Password Hashing**: Bcryptjs with salt rounds = 10
2. **OTP Security**: 
   - 6-digit random code
   - 10-minute expiration
   - Single use (verified flag)
3. **Email Verification**: Required before account activation
4. **Input Validation**: Server-side validation on all endpoints
5. **Error Handling**: Generic error messages to prevent user enumeration

## Frontend Components

### LoginForm (`components/auth/login-form.tsx`)
- Email and password inputs
- Real-time validation
- Error message display
- Loading state
- Forgot password link (placeholder)

### SignupForm (`components/auth/signup-form.tsx`)
- Email and password inputs
- Password confirmation
- Input validation
- OTP verification step
- Error handling

### OtpVerification (`components/auth/otp-verification.tsx`)
- 6 individual OTP input boxes
- Auto-focus between inputs
- Resend OTP button with feedback
- Error message display
- Loading state during verification

## Testing the System

### Test Signup:
1. Go to http://localhost:3000/signup
2. Enter email and password (min 6 chars)
3. Click "Sign Up"
4. Check email for OTP (if configured correctly)
5. Enter OTP to complete signup
6. Redirected to journal page

### Test Login:
1. Go to http://localhost:3000/login
2. Enter email and password
3. Click "Login"
4. Redirected to journal page

### Test with Demo Gmail (Optional):
If you don't want to configure real email:
1. In `lib/email.ts`, comment out the `sendMail()` call for testing
2. OTP will be logged to console instead
3. Copy OTP from console and use in form

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string is correct
- Check IP whitelist in MongoDB Atlas (allow all IPs for dev)
- Ensure database name matches

### Email Not Sending
- Verify EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS in .env.local
- For Gmail: Ensure 2FA is enabled and app password is used
- Check email logs in browser console
- Verify SMTP settings for your email provider

### OTP Verification Fails
- Ensure OTP hasn't expired (10 minutes)
- Check OTP is entered correctly
- Check database connectivity

## Future Enhancements

1. JWT tokens for session management
2. Refresh token mechanism
3. Email verification on login attempts from new devices
4. Rate limiting on OTP attempts
5. Password reset functionality
6. Social login (Google, GitHub)
7. Two-factor authentication (2FA)
8. Account recovery options

## Environment Variables Checklist

- [ ] MONGODB_URI set correctly
- [ ] EMAIL_SERVICE configured
- [ ] EMAIL_USER (email address)
- [ ] EMAIL_PASS (app password)
- [ ] NEXT_PUBLIC_APP_URL matches your domain
