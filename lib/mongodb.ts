import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

interface Cached {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

let cached: Cached = {
  conn: null,
  promise: null,
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection")
    return cached.conn
  }

  if (!cached.promise) {
    console.log("Creating new MongoDB connection to:", MONGODB_URI?.split("@")[1] || "unknown")
    
    cached.promise = mongoose.connect(MONGODB_URI!, {
      retryWrites: true,
      w: "majority",
    }).then((mongoose) => {
      console.log("MongoDB connected successfully")
      return mongoose
    }).catch((error) => {
      console.error("MongoDB connection failed:", error)
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("Failed to establish cached connection:", e)
    throw e
  }

  return cached.conn
}
