import { NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import OTP from "@/lib/models/OTP"
import { sendWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    console.log("OTP verification request received")
    
    await connectToDatabase()
    console.log("Database connected for OTP verification")

    const { email, otp } = await req.json()
    console.log("Verifying OTP for email:", email)

    // Validation
    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    // Find and verify OTP
    const otpRecord = await OTP.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() },
      verified: false,
    })

    if (!otpRecord) {
      console.log("OTP not found or expired for:", email)
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    // Mark OTP as verified
    otpRecord.verified = true
    await otpRecord.save()
    console.log("OTP verified successfully")

    // Send welcome email
    try {
      const name = email.split("@")[0]
      await sendWelcomeEmail(email, name)
      console.log("Welcome email sent")
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return NextResponse.json(
      {
        message: "Email verified successfully",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("OTP verification error:", error)
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      console.error("Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
