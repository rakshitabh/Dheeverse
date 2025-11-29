import mongoose, { Schema, Document, PreSaveMiddlewareFunction } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  email: string
  password: string
  name?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      default: "User",
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving - using async/await pattern
userSchema.pre<IUser>("save", async function (this: IUser) {
  // Only hash if password has been modified
  if (!this.isModified("password")) {
    return
  }

  try {
    console.log("Pre-save: Hashing password for user:", this.email)
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash
    console.log("Pre-save: Password hashed successfully")
  } catch (error) {
    console.error("Pre-save: Password hashing failed:", error)
    throw error
  }
})

// Method to compare password
userSchema.methods.comparePassword = async function (this: IUser, password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>("User", userSchema)
