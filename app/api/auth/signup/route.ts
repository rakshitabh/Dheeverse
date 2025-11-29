import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import User from "@/lib/models/User"
import OTP from "@/lib/models/OTP"
import { sendOTPEmail, generateOTP } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    console.log("=== Signup Request Started ===")
    
    const { email, password } = await req.json()
    console.log("Signup data received - Email:", email)

    // Validation
    if (!email || !password) {
      console.log("Validation failed: missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Validation failed: password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    console.log("Connecting to database...")
    await connectToDatabase()
    console.log("Database connected successfully")

    // Check if user already exists
    console.log("Checking if user already exists...")
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create user
    console.log("Creating new user...")
    const user = new User({
      email,
      password,
      name: email.split("@")[0],
    })

    console.log("Saving user to database...")
    await user.save()
    console.log("User saved successfully with ID:", user._id)

    // Generate and save OTP
    console.log("Generating OTP...")
    const otp = generateOTP()
    console.log("OTP generated:", otp)
    
    await OTP.deleteMany({ email })
    console.log("Old OTPs deleted")
    
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
    console.log("OTP saved to database")

    // Send OTP email - non-blocking
    console.log("Sending OTP email...")
    let emailSent = false
    let emailError = null

    try {
      await sendOTPEmail(email, otp)
      emailSent = true
      console.log("OTP email sent successfully")
    } catch (emailErr) {
      emailError = emailErr
      console.error("Failed to send OTP email:", emailErr)
    }

    // Return success regardless of email status
    if (emailSent) {
      console.log("Signup completed successfully with email sent")
      return NextResponse.json(
        {
          message: "User registered successfully. OTP sent to email.",
          userId: user._id,
          email: user.email,
        },
        { status: 201 }
      )
    } else {
      console.log("Signup completed but email failed - returning partial success")
      return NextResponse.json(
        {
          message: "User created but OTP email could not be sent. Please check your email configuration and try resending OTP.",
          userId: user._id,
          email: user.email,
          emailError: String(emailError),
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("=== Signup Error ===")
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error)
    console.error("Error message:", String(error))
    
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: String(error),
      }, 
      { status: 500 }
    )
  }
}
