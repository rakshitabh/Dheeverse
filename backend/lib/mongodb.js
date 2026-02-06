const mongoose = require('mongoose');

// Allow running the app even if MONGODB_URI is not set,
// by falling back to a local MongoDB instance and logging a warning.
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wellness_journal';

if (!process.env.MONGODB_URI) {
  console.warn(
    '[MongoDB] ⚠️  MONGODB_URI is not set in .env. Please configure MongoDB Atlas or install MongoDB locally.'
  );
  console.warn('[MongoDB] Get MongoDB Atlas (FREE): https://www.mongodb.com/cloud/atlas/register');
}

let cached = {
  conn: null,
  promise: null,
};

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const connectionString = MONGODB_URI.includes('@') 
      ? MONGODB_URI.split('@')[1] 
      : MONGODB_URI;
    console.log('[MongoDB] Connecting to:', connectionString);

    cached.promise = mongoose
      .connect(MONGODB_URI, {
        retryWrites: true,
        w: 'majority',
        serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
      })
      .then((mongooseInstance) => {
        console.log('[MongoDB] ✅ Connected successfully');
        return mongooseInstance;
      })
      .catch((error) => {
        console.error('[MongoDB] ❌ Connection failed:', error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = { connectToDatabase };

