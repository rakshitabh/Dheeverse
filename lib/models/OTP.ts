import mongoose, { Schema, Document } from "mongoose"

export interface IOTP extends Document {
  email: string
  otp: string
  expiresAt: Date
  verified: boolean
  createdAt: Date
}

const otpSchema = new Schema<IOTP>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Delete expired OTPs automatically
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.OTP || mongoose.model<IOTP>("OTP", otpSchema)
