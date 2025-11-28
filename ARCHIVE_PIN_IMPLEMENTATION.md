# Archive Page & PIN Lock System - Implementation Summary

## Changes Made

### 1. Archive Page (`app/archive/page.tsx`)
- **Fixed**: Removed duplicate code and syntax errors
- **Added**: MongoDB integration for PIN retrieval
- **Features**:
  - Dynamic PIN lock based on database settings
  - User can unlock archive with their personal PIN
  - Displays "Loading archive..." while fetching PIN from database
  - PIN attempt limiting (max 3 attempts)
  - Full archive management with restore and delete functionality
  - Bulk selection and operations

### 2. API Endpoint (`app/api/user/archive-pin/route.ts`)
- **GET**: Fetches the current archive PIN from MongoDB
  - Returns `{ pin: "1234" }` if set, or `{ pin: null }` if not set
  - Uses `x-user-id` header for user identification

- **POST**: Sets or updates the archive PIN
  - Validates PIN is exactly 4 digits
  - Stores PIN in MongoDB collection `user_settings`
  - Upserts document if doesn't exist

- **DELETE**: Removes the archive PIN
  - Allows users to disable PIN lock
  - Removes PIN field from user settings

### 3. Settings Page Updates (`app/settings/page.tsx`)
- **Added PIN Lock Section**:
  - Toggle to enable/disable PIN lock
  - Input field for 4-digit PIN
  - "Save PIN" button to persist to database
  - Toast notifications for success/error feedback

- **New Function**: `handleSavePin()`
  - Validates PIN format (exactly 4 digits)
  - Makes API request to save/remove PIN
  - Shows appropriate toast notifications

### 4. Dependencies
- Added `mongodb` package to handle database operations
- Version: `^6.0.0`

## How It Works

1. **User Sets PIN** (Settings Page):
   - User enables "PIN Lock for Archive"
   - Enters 4-digit PIN
   - Clicks "Save PIN"
   - PIN is saved to MongoDB

2. **User Accesses Archive** (Archive Page):
   - Page fetches PIN from database via `/api/user/archive-pin`
   - If PIN is set and user not unlocked, shows PIN lock screen
   - User enters PIN to unlock
   - Max 3 attempts before temporary lockout
   - Once unlocked, can manage archived entries

## Environment Setup

1. Create `.env.local` file in root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wellness_journal
```

2. Install dependencies:
```bash
npm install
```

3. MongoDB Collection Structure:
```json
{
  "_id": ObjectId,
  "userId": "user-id-string",
  "archivePin": "1234",
  "updatedAt": ISODate
}
```

## User Authentication Note

Currently, the system uses a placeholder `userId` from the `x-user-id` header. For production:
- Implement proper authentication (JWT, NextAuth.js, etc.)
- Extract actual user ID from authenticated session
- Hash PIN before storing in database (use bcrypt)
- Add rate limiting to prevent brute force attacks

## Testing

1. Set PIN in Settings:
   - Go to Settings > Privacy & Security
   - Enable "PIN Lock for Archive"
   - Enter "1234" as PIN
   - Click "Save PIN"

2. Access Archive:
   - Navigate to Archive page
   - Enter PIN "1234" to unlock
   - Test with wrong PIN (should show error)
   - After 3 wrong attempts, button should be disabled

## Security Recommendations

- [ ] Implement bcrypt hashing for PIN before storage
- [ ] Add rate limiting to API endpoints
- [ ] Implement proper user authentication
- [ ] Add audit logging for PIN changes
- [ ] Consider adding 2FA for additional security
- [ ] Add timeout after failed attempts
