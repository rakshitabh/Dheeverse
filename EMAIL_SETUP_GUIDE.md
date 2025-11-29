# Email Configuration Setup Guide

## Problem
OTP emails are not being sent to registered email addresses.

## Solution

### Option 1: Gmail App Password (Recommended)

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/
2. Click "Security" in the left menu
3. Find "2-Step Verification" and enable it
4. Follow the prompts to complete 2FA setup

**Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. If prompted to sign in again, do so
3. Select "Mail" as the app
4. Select "Windows Computer" as the device (or your device)
5. Click "Generate"
6. Google will show a 16-character password
7. Copy this password (without spaces)

**Step 3: Update .env.local**
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Important:** Use the 16-character app password, NOT your Gmail password!

### Option 2: Gmail Less Secure App Password

If you prefer not to enable 2FA:

1. Go to https://myaccount.google.com/security
2. Scroll down to "Less secure app access"
3. Click "Turn on" (if available)
4. Use your regular Gmail password in .env.local

### Option 3: Alternative Email Service

If using a different email provider (Outlook, Yahoo, etc.):

1. Update `EMAIL_SERVICE` to your provider:
   - `outlook` for Outlook/Hotmail
   - `yahoo` for Yahoo Mail
   - `aol` for AOL
   - Or leave as `smtp` and provide custom SMTP settings

2. Use your email provider's app password or create an account-specific password

### Option 4: Custom SMTP Configuration

For any email provider:

```env
# Instead of using 'service', use these settings:
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
```

And update `lib/email.ts`:
```typescript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})
```

## Testing Email Configuration

After setting up your credentials:

1. Go to http://localhost:3000/signup
2. Sign up with your test email
3. Check the dev server logs for:
   - `✓ SMTP connection verified successfully!`
   - `✓ Email sent successfully!`
4. Check your email inbox (including spam folder)
5. Enter the OTP code to complete verification

## Troubleshooting

### SMTP Error: 535 - Invalid credentials
- Your email password is incorrect
- For Gmail, you're using the wrong password (use app password, not Gmail password)
- Try resetting your password

### SMTP Error: 534 - Less secure app access
- You need to enable "Less secure app access" OR use an app password with 2FA
- Gmail no longer allows regular passwords for third-party apps

### Email sent but not received
- Check spam/junk folder
- Check if your email has filters enabled
- Verify the recipient email address is correct
- Check email provider's settings for blocked senders

### Connection timeout
- Check your internet connection
- Verify SMTP host and port are correct
- Check if your firewall blocks outgoing SMTP (port 587 or 465)

## Current Configuration

Your current .env.local:
```
EMAIL_SERVICE=gmail
EMAIL_USER=tanusonnad@gmail.com
EMAIL_PASS=wswu uqoi xrfv ukxj
```

**Action Required:**
1. Go to https://myaccount.google.com/apppasswords
2. Generate a new 16-character app password
3. Update `EMAIL_PASS` with the new password
4. Save the file
5. The server will automatically reconnect and verify the new credentials

## Gmail App Password Tutorial (Step-by-Step)

1. **Enable 2-Step Verification:**
   - Open https://myaccount.google.com/
   - Left menu → Security
   - Find "2-Step Verification" and click on it
   - Follow the steps to enable 2FA
   - You'll need to verify your phone number

2. **Generate App Password:**
   - Open https://myaccount.google.com/apppasswords
   - You should now see this option (only available if 2FA is enabled)
   - App: Select "Mail"
   - Device: Select "Windows Computer" or your device type
   - Click "Generate"
   - Google shows a 16-letter password like: `abcd efgh ijkl mnop`
   - Remove the spaces: `abcdefghijklmnop`
   - This is your email password!

3. **Update .env.local:**
   ```
   EMAIL_PASS=abcdefghijklmnop
   ```

4. **Restart the server** and test signup again.

## Additional Notes

- **Security:** Never share your app password
- **Different devices:** Each device/app can have its own app password
- **Revoke:** If compromised, go back to apppasswords and revoke it
- **Backup codes:** Save your 2FA backup codes in a secure location

For more help, visit:
- Gmail Help: https://support.google.com/accounts/answer/185833
- Nodemailer Docs: https://nodemailer.com/smtp/
