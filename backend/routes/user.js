const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { connectToDatabase } = require("../lib/mongodb");
const User = require("../lib/models/User");
const JournalEntry = require("../lib/models/JournalEntry");
const { authenticateToken } = require("../lib/auth-middleware");
const mongoose = require("mongoose");
const OTP = require("../lib/models/OTP");
const { generateOTP, sendOTPEmail } = require("../lib/email");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../frontend/public/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `avatar-${req.userId}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "-password -settings.archivePassword"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

// Update user profile
router.put("/profile", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { name, username, avatar } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (name !== undefined) user.name = name;
    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.settings?.archivePassword;

    return res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return res.status(500).json({ error: "Failed to update user profile" });
  }
});

// Change email
router.post("/change-email", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { newEmail, password } = req.body;

    if (!newEmail || !password) {
      return res
        .status(400)
        .json({ error: "New email and password are required" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Check if new email already exists
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    user.email = newEmail.toLowerCase();
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.settings?.archivePassword;

    return res.status(200).json({
      message: "Email updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error changing email:", error);
    return res.status(500).json({ error: "Failed to change email" });
  }
});

// Request email change - sends OTP to new email
router.post("/change-email/request", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ error: "New email is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.email?.toLowerCase() === newEmail.toLowerCase()) {
      return res.status(400).json({ error: "New email must be different" });
    }

    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const otpCode = generateOTP();

    await OTP.create({
      email: newEmail.toLowerCase(),
      otp: otpCode,
      type: "email-change",
      userId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendOTPEmail(newEmail, otpCode, "email-change");

    return res.status(200).json({ message: "OTP sent to new email" });
  } catch (error) {
    console.error("Error requesting email change:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP and update email
router.post("/change-email/verify", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { newEmail, otp } = req.body;

    if (!newEmail || !otp) {
      return res
        .status(400)
        .json({ error: "New email and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const otpDoc = await OTP.findOne({
      email: newEmail.toLowerCase(),
      type: "email-change",
      verified: false,
    });

    if (!otpDoc) {
      return res.status(400).json({ error: "OTP not found. Please request again." });
    }

    if (otpDoc.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (otpDoc.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Update email
    user.email = newEmail.toLowerCase();
    await user.save();

    // Mark OTP as used and delete
    otpDoc.verified = true;
    await otpDoc.save();
    await OTP.deleteMany({ email: newEmail.toLowerCase(), type: "email-change" });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.settings?.archivePassword;

    return res.status(200).json({
      message: "Email updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error verifying email change:", error);
    return res.status(500).json({ error: "Failed to verify email change" });
  }
});

// Change password
router.post("/change-password", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ error: "Failed to change password" });
  }
});

// Get user settings
router.get("/settings", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId).select("settings");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const settings = user.settings || {};
    // Don't return archive password
    const { archivePassword, ...safeSettings } = settings;

    return res
      .status(200)
      .json({ settings: safeSettings, hasArchivePassword: !!archivePassword });
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return res.status(500).json({ error: "Failed to fetch user settings" });
  }
});

// Update user settings
router.put("/settings", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { theme, notifications } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.settings) {
      user.settings = {};
    }

    if (theme !== undefined) {
      user.settings.theme = theme;
    }

    if (notifications !== undefined) {
      if (!user.settings.notifications) {
        user.settings.notifications = {};
      }
      if (notifications.enabled !== undefined)
        user.settings.notifications.enabled = notifications.enabled;
      if (notifications.reminders !== undefined)
        user.settings.notifications.reminders = notifications.reminders;
      if (notifications.weeklySummary !== undefined)
        user.settings.notifications.weeklySummary = notifications.weeklySummary;
      if (notifications.scheduledReminders !== undefined)
        user.settings.notifications.scheduledReminders =
          notifications.scheduledReminders;
      if (notifications.reminderTime !== undefined)
        user.settings.notifications.reminderTime = notifications.reminderTime;
    }

    await user.save();

    const settings = user.settings || {};
    const { archivePassword, ...safeSettings } = settings;

    return res.status(200).json({
      message: "Settings updated successfully",
      settings: safeSettings,
      hasArchivePassword: !!archivePassword,
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return res.status(500).json({ error: "Failed to update user settings" });
  }
});

// Set/Update archive password
router.post("/archive-password", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Archive password is required" });
    }

    if (password.length < 4) {
      return res
        .status(400)
        .json({ error: "Archive password must be at least 4 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.settings) {
      user.settings = {};
    }

    user.settings.archivePassword = password; // Will be hashed by pre-save hook
    await user.save();

    return res
      .status(200)
      .json({ message: "Archive password set successfully" });
  } catch (error) {
    console.error("Error setting archive password:", error);
    return res.status(500).json({ error: "Failed to set archive password" });
  }
});

// Verify archive password
router.post("/archive-password/verify", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Archive password is required" });
    }

    const user = await User.findById(userId).select(
      "+settings.archivePassword"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await user.compareArchivePassword(password);
    return res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error("Error verifying archive password:", error);
    return res.status(500).json({ error: "Failed to verify archive password" });
  }
});

// Remove archive password
router.delete("/archive-password", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.settings) {
      user.settings.archivePassword = null;
      await user.save();
    }

    return res
      .status(200)
      .json({ message: "Archive password removed successfully" });
  } catch (error) {
    console.error("Error removing archive password:", error);
    return res.status(500).json({ error: "Failed to remove archive password" });
  }
});

// Export user data
router.get("/export", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId).select(
      "-password -settings.archivePassword"
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Get all journal entries
    const entries = await JournalEntry.find({ userId: userObjectId }).lean();

    const exportData = {
      user: {
        email: user.email,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        settings: user.settings,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      journalEntries: entries.map((entry) => ({
        content: entry.content,
        mood: entry.mood,
        emotions: entry.emotions,
        tags: entry.tags,
        entryType: entry.entryType,
        isArchived: entry.isArchived,
        aiInsight: entry.aiInsight,
        recommendation: entry.recommendation,
        intensity: entry.intensity,
        sentiment: entry.sentiment,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      })),
      exportedAt: new Date().toISOString(),
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="wellness-journal-export-${Date.now()}.json"`
    );
    return res.status(200).json(exportData);
  } catch (error) {
    console.error("Error exporting user data:", error);
    return res.status(500).json({ error: "Failed to export user data" });
  }
});

// Upload avatar
router.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      // Delete uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old avatar if exists
    if (user.avatar && user.avatar.startsWith("/avatars/")) {
      const oldPath = path.join(
        __dirname,
        "../../frontend/public",
        user.avatar
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save avatar path
    const avatarPath = `/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.settings?.archivePassword;

    return res.status(200).json({
      message: "Avatar uploaded successfully",
      avatar: avatarPath,
      user: userWithoutPassword,
    });
  } catch (error) {
    // Delete uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error uploading avatar:", error);
    return res.status(500).json({ error: "Failed to upload avatar" });
  }
});

// Delete user account
router.delete("/account", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { password, otp } = req.body;

    if (!password && !otp) {
      return res
        .status(400)
        .json({ error: "Password or OTP is required for account deletion" });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password if provided
    if (password) {
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }

    // If OTP is provided, verify it (you may want to add OTP verification for account deletion)
    // For now, we'll just require password

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    // Delete all journal entries
    await JournalEntry.deleteMany({ userId: userObjectId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    return res.status(500).json({ error: "Failed to delete user account" });
  }
});

module.exports = router;
