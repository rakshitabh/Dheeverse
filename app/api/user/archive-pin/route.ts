import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = "wellness_journal"
const collectionName = "user_settings"

async function connectToDatabase() {
  const client = await MongoClient.connect(mongoUri)
  const db = client.db(dbName)
  return { client, db }
}

export async function GET(request: NextRequest) {
  try {
    const { db, client } = await connectToDatabase()

    // Get user ID from session or request (you'll need to implement proper authentication)
    // For now, using a default user
    const userId = request.headers.get("x-user-id") || "default-user"

    const settings = await db.collection(collectionName).findOne({ userId })

    await client.close()

    if (!settings || !settings.archivePin) {
      return NextResponse.json({ pin: null }, { status: 200 })
    }

    return NextResponse.json({ pin: settings.archivePin }, { status: 200 })
  } catch (error) {
    console.error("Error fetching archive PIN:", error)
    return NextResponse.json({ error: "Failed to fetch archive PIN" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    if (!pin || pin.length !== 4) {
      return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 })
    }

    const { db, client } = await connectToDatabase()

    // Get user ID from session or request
    const userId = request.headers.get("x-user-id") || "default-user"

    const result = await db.collection(collectionName).updateOne(
      { userId },
      { $set: { archivePin: pin, updatedAt: new Date() } },
      { upsert: true }
    )

    await client.close()

    return NextResponse.json({ success: true, message: "Archive PIN updated" }, { status: 200 })
  } catch (error) {
    console.error("Error updating archive PIN:", error)
    return NextResponse.json({ error: "Failed to update archive PIN" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { db, client } = await connectToDatabase()

    // Get user ID from session or request
    const userId = request.headers.get("x-user-id") || "default-user"

    await db.collection(collectionName).updateOne(
      { userId },
      { $unset: { archivePin: "" } }
    )

    await client.close()

    return NextResponse.json({ success: true, message: "Archive PIN removed" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting archive PIN:", error)
    return NextResponse.json({ error: "Failed to delete archive PIN" }, { status: 500 })
  }
}
