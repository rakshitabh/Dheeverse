import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function POST(req: NextRequest) {
  try {
    console.log("Login request received")
    
    await connectToDatabase()
    console.log("Database connected successfully")

    const { email, password } = await req.json()
    console.log("Login attempt for email:", email)

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user and check password
    const user = await User.findOne({ email }).select("+password")
    console.log("User found:", !!user)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const isPasswordValid = await user.comparePassword(password)
    console.log("Password valid:", isPasswordValid)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Create response with user data (excluding password)
    const userWithoutPassword = user.toObject()
    delete (userWithoutPassword as any).password

    console.log("Login successful for user:", email)

    return NextResponse.json(
      {
        message: "Login successful",
        user: userWithoutPassword,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Login error:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
