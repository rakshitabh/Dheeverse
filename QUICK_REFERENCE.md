# Quick Reference - PIN Lock Implementation

## Files Modified/Created

### Modified Files
1. **`app/archive/page.tsx`**
   - Removed duplicate code
   - Fixed syntax errors
   - Added MongoDB PIN fetch on page load
   - Implemented PIN lock screen
   - Dynamic PIN-based access control

2. **`app/settings/page.tsx`**
   - Added PIN Lock section in Privacy & Security
   - Added PIN input and save functionality
   - Connected to MongoDB API

3. **`package.json`**
   - Added `"mongodb": "^6.0.0"` dependency

### New Files Created
1. **`app/api/user/archive-pin/route.ts`**
   - GET: Fetch PIN from MongoDB
   - POST: Save PIN to MongoDB
   - DELETE: Remove PIN from MongoDB

2. **`.env.local.example`**
   - Template for environment variables
   - Instructions for MongoDB setup

3. **`ARCHIVE_PIN_IMPLEMENTATION.md`**
   - Complete implementation guide
   - Architecture overview
   - User flow documentation

4. **`MONGODB_SETUP.md`**
   - Step-by-step MongoDB setup
   - Connection string instructions
   - Database schema reference

## Installation Steps

```bash
# 1. Install MongoDB driver
npm install

# 2. Create .env.local with MongoDB URI
# Copy from .env.local.example and add your connection string

# 3. Run the dev server
npm run dev
```

## Environment Variables
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness_journal?retryWrites=true&w=majority
```

## Feature Testing Checklist

- [ ] Install dependencies: `npm install`
- [ ] Set MONGODB_URI in `.env.local`
- [ ] Go to Settings > Privacy & Security
- [ ] Toggle "PIN Lock for Archive" on
- [ ] Enter PIN "1234" and click "Save PIN"
- [ ] See success toast notification
- [ ] Navigate to Archive page
- [ ] See PIN lock screen
- [ ] Enter correct PIN "1234"
- [ ] Archive unlocks successfully
- [ ] Try wrong PIN (shows error)
- [ ] Test 3 failed attempts (button disables)

## Key Components

### Archive Page State
```typescript
const [pinCode, setPinCode] = useState("")           // Current PIN input
const [pinAttempts, setPinAttempts] = useState(0)    // Failed attempt count
const [isUnlocked, setIsUnlocked] = useState(false)  // Unlock status
const [storedPin, setStoredPin] = useState(null)     // PIN from database
const [loading, setLoading] = useState(true)         // Loading state
const [error, setError] = useState(null)             // Error messages
```

### Archive Page Logic
1. On mount: fetch PIN from `/api/user/archive-pin`
2. If PIN is set and user not unlocked: show lock screen
3. User enters PIN and clicks submit
4. If correct: unlock access to archive
5. If wrong: show error, increment attempts
6. If 3+ attempts: disable button, show lockout message

### Settings Page
1. Toggle enables/disables PIN input
2. Enter 4-digit PIN
3. Click "Save PIN" to call API
4. API saves to MongoDB
5. Show success/error toast

## Database Collections

### user_settings
```javascript
db.createCollection("user_settings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        _id: { bsonType: "objectId" },
        userId: { bsonType: "string" },
        archivePin: { bsonType: "string" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
```

## API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user/archive-pin` | Fetch user's PIN |
| POST | `/api/user/archive-pin` | Save/update PIN |
| DELETE | `/api/user/archive-pin` | Remove PIN |

## Debugging Tips

1. **Check MongoDB Connection:**
   ```bash
   # Use MongoDB Compass to test connection
   # Paste your MONGODB_URI and verify connection works
   ```

2. **Check API Response:**
   ```typescript
   // In browser dev tools > Network tab
   // Look for requests to /api/user/archive-pin
   // Check response body and status
   ```

3. **Check Console Errors:**
   ```typescript
   // Browser console should show:
   // - No "Failed to load archive settings" errors
   // - PIN fetch successful message
   ```

4. **MongoDB Documents:**
   ```javascript
   // In MongoDB Atlas UI
   // View > Browse Collections > user_settings
   // Should see document with your PIN
   ```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Failed to load archive settings" | Check MONGODB_URI in .env.local |
| PIN not saving | Verify MongoDB connection works |
| Lock screen always shows | Check storedPin value in state |
| Can't unlock with correct PIN | Verify PIN exactly matches in database |
| 404 on API route | Check file path is `app/api/user/archive-pin/route.ts` |

## Next Phase - Production Ready

1. Implement bcrypt hashing for PIN
2. Add NextAuth.js for proper authentication
3. Add rate limiting to API routes
4. Add audit logging for security events
5. Implement PIN history
6. Add backup codes for account recovery
