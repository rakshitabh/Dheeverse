import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import OTP from "@/lib/models/OTP"
import { sendOTPEmail, generateOTP } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    console.log("Resend OTP request received")
    
    await connectToDatabase()
    console.log("Database connected for OTP resend")

    const { email } = await req.json()
    console.log("Resending OTP for email:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Delete old OTPs
    await OTP.deleteMany({ email })
    console.log("Old OTPs deleted")

    // Generate new OTP
    const otp = generateOTP()
    console.log("New OTP generated")
    
    await OTP.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    })
    console.log("New OTP saved to database")

    // Send OTP email
    try {
      await sendOTPEmail(email, otp)
      console.log("OTP email sent successfully")
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError)
      return NextResponse.json(
        { error: "Failed to send OTP email. Please check your email configuration." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "OTP sent to email" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Resend OTP error:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
