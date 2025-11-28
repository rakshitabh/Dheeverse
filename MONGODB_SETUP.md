# MongoDB Setup Guide for Wellness Journal App

## Quick Start

### 1. Get MongoDB Connection String

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or log in
3. Create a new project
4. Create a cluster (M0 free tier)
5. Click "Connect" on your cluster
6. Choose "Drivers" connection method
7. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
   ```

#### Option B: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string:
   ```
   mongodb://localhost:27017/wellness_journal
   ```

### 2. Set Environment Variable

Create `.env.local` in your project root:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/wellness_journal?retryWrites=true&w=majority
```

Replace `username` and `password` with your actual MongoDB credentials.

### 3. Install MongoDB Driver

```bash
npm install mongodb
```

### 4. Verify Connection

The app will automatically:
- Connect to MongoDB when users access the Archive page
- Fetch PIN settings from the `user_settings` collection
- Create collections and documents as needed

## Database Schema

### Collections

#### `user_settings`
Stores user-specific settings including archive PIN:

```json
{
  "_id": ObjectId("..."),
  "userId": "user-123",
  "archivePin": "1234",
  "createdAt": ISODate("2024-11-28T10:00:00Z"),
  "updatedAt": ISODate("2024-11-28T10:00:00Z")
}
```

## API Routes

### GET `/api/user/archive-pin`
Fetches the archive PIN for current user

**Response:**
```json
{
  "pin": "1234"
}
```

**Response if no PIN set:**
```json
{
  "pin": null
}
```

### POST `/api/user/archive-pin`
Sets or updates the archive PIN

**Request:**
```json
{
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Archive PIN updated"
}
```

### DELETE `/api/user/archive-pin`
Removes the archive PIN

**Response:**
```json
{
  "success": true,
  "message": "Archive PIN removed"
}
```

## User Flow

1. **User navigates to Settings page**
   - Finds "Privacy & Security" section
   - Toggles "PIN Lock for Archive" on
   - Enters 4-digit PIN (e.g., "1234")
   - Clicks "Save PIN" button

2. **PIN is saved to MongoDB**
   - API validates PIN is exactly 4 digits
   - Updates/creates document in `user_settings` collection
   - Shows success toast

3. **User navigates to Archive page**
   - API fetches PIN from MongoDB
   - If PIN is set, displays lock screen
   - User must enter correct PIN to access archive
   - Max 3 attempts allowed

## Security Best Practices

### For Development
The current implementation stores PIN in plain text. This is OK for development.

### For Production
Implement these security measures:

1. **Hash the PIN:**
```typescript
import bcrypt from 'bcrypt'

// When saving PIN
const hashedPin = await bcrypt.hash(pin, 10)

// When verifying PIN
const isValid = await bcrypt.compare(enteredPin, storedPin)
```

2. **Add bcrypt package:**
```bash
npm install bcrypt
npm install --save-dev @types/bcrypt
```

3. **Implement proper authentication:**
   - Use NextAuth.js or similar
   - Extract user ID from session
   - Don't rely on headers

4. **Add rate limiting:**
```typescript
// In API route
const MAX_ATTEMPTS = 3
const LOCKOUT_TIME = 15 * 60 * 1000 // 15 minutes

// Track failed attempts per IP
const failedAttempts = new Map()
```

5. **Add audit logging:**
```typescript
// Log PIN changes
await db.collection('audit_logs').insertOne({
  userId,
  action: 'PIN_CHANGED',
  timestamp: new Date(),
  ipAddress: request.ip
})
```

## Troubleshooting

### "Failed to load archive settings"
- Check MongoDB connection string in `.env.local`
- Verify MongoDB service is running
- Check MongoDB Atlas IP whitelist (should allow all IPs for development)

### "Error: ENOTFOUND"
- MongoDB Atlas cluster might not be created
- Check connection string format
- Try using MongoDB Compass to test connection

### PIN not persisting
- Verify `MONGODB_URI` is set correctly
- Check MongoDB is running
- Look at browser console for API errors

## Next Steps

1. Set up authentication system for production
2. Implement PIN hashing with bcrypt
3. Add rate limiting to prevent brute force
4. Consider adding additional security layers (2FA, biometric)
5. Set up MongoDB backups for production
