const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
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
    username: {
      type: String,
      default: null,
    },
    settings: {
      theme: {
        type: String,
        enum: ["light", "dark", "soft"],
        default: "light",
      },
      notifications: {
        enabled: {
          type: Boolean,
          default: true,
        },
        reminders: {
          type: Boolean,
          default: true,
        },
        weeklySummary: {
          type: Boolean,
          default: false,
        },
        scheduledReminders: {
          type: Boolean,
          default: false,
        },
        reminderTime: {
          type: String,
          default: "21:30",
        },
      },
      archivePassword: {
        type: String,
        default: null,
        select: false, // Don't return by default
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash passwords before saving
userSchema.pre("save", async function () {
  // Hash password if modified
  if (this.isModified("password")) {
    try {
      console.log("Pre-save: Hashing password for user:", this.email);
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      console.log("Pre-save: Password hashed successfully");
    } catch (error) {
      console.error("Pre-save: Password hashing failed:", error);
      throw error;
    }
  }

  // Hash archive password if modified and not null
  if (
    this.isModified("settings.archivePassword") &&
    this.settings?.archivePassword
  ) {
    // Only hash if it's not already hashed (check if it's a bcrypt hash)
    if (!this.settings.archivePassword.startsWith("$2")) {
      try {
        console.log("Pre-save: Hashing archive password for user:", this.email);
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(this.settings.archivePassword, salt);
        this.settings.archivePassword = hash;
        console.log("Pre-save: Archive password hashed successfully");
      } catch (error) {
        console.error("Pre-save: Archive password hashing failed:", error);
        throw error;
      }
    }
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to compare archive password
userSchema.methods.compareArchivePassword = async function (password) {
  if (!this.settings?.archivePassword) {
    return false;
  }
  return bcrypt.compare(password, this.settings.archivePassword);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
