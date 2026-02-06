const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { connectToDatabase } = require("../lib/mongodb");
const JournalEntry = require("../lib/models/JournalEntry");
const { authenticateToken } = require("../lib/auth-middleware");
const {
  encryptSensitiveFields,
  decryptSensitiveFields,
} = require("../lib/encryption");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all entries for a user
router.get("/", async (req, res) => {
  try {
    await connectToDatabase();

    // Get userId from authenticated request
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Convert to ObjectId if it's a valid MongoDB ID
    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const { archived, limit, skip } = req.query;

    const query = { userId: userObjectId };

    if (archived !== undefined) {
      query.isArchived = archived === "true";
    }

    const entries = await JournalEntry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit) : 100)
      .skip(skip ? parseInt(skip) : 0)
      .lean();

    const decryptedEntries = entries.map((entry) => decryptSensitiveFields(entry));

    return res.status(200).json({ entries: decryptedEntries });
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    return res
      .status(500)
      .json({
        error: "Failed to fetch journal entries",
        details: String(error),
      });
  }
});

// Get a single entry by ID
router.get("/:id", async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const entry = await JournalEntry.findOne({
      _id: id,
      userId: userObjectId,
    }).lean();

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json({ entry: decryptSensitiveFields(entry) });
  } catch (error) {
    console.error("Error fetching journal entry:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch journal entry", details: String(error) });
  }
});

// Create a new entry
router.post("/", async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const {
      content,
      mood,
      emotions,
      tags,
      entryType,
      aiInsight,
      recommendation,
      recommendedActivities,
      intensity,
      stressLevel,
      keywords,
      aiSource,
      sentiment,
      question,
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required" });
    }

    const baseEntry = {
      userId: userObjectId,
      content: content.trim(),
      mood: mood || "Neutral",
      emotions: emotions || [],
      tags: tags || [],
      entryType: entryType || "text",
      aiInsight,
      recommendation,
      recommendedActivities: recommendedActivities || {
        wellness: [],
        natureSounds: [],
        games: [],
      },
      question,
      intensity,
      stressLevel,
      keywords: keywords || [],
      aiSource,
      sentiment: sentiment || { score: 0, label: "neutral" },
    };

    const encryptedEntry = encryptSensitiveFields(baseEntry);

    const entry = new JournalEntry(encryptedEntry);

    console.log("Before save", { 
      userId: String(userObjectId), 
      hasContent: !!encryptedEntry.content,
      aiSource: aiSource,
      mood: mood 
    });

    await entry.save();

    console.log("Saved document ID", entry._id ? String(entry._id) : "unknown");
    console.log("Saved entry aiSource:", entry.aiSource);

    // Decrypt before sending back so the client immediately sees human-readable data
    const plainEntry = decryptSensitiveFields(entry.toObject());

    return res.status(201).json({
      message: "Entry created successfully",
      entry: plainEntry,
    });
  } catch (error) {
    console.error("Error creating journal entry:", error);
    return res
      .status(500)
      .json({
        error: "Failed to create journal entry",
        details: String(error),
      });
  }
});

// Update an entry
router.put("/:id", async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const entry = await JournalEntry.findOne({ _id: id, userId: userObjectId });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const {
      content,
      mood,
      emotions,
      tags,
      aiInsight,
      recommendation,
      recommendedActivities,
      intensity,
      sentiment,
      question,
    } = req.body;

    if (content !== undefined) entry.content = encryptSensitiveFields({ content: content.trim() }).content;
    if (mood !== undefined) entry.mood = mood;
    if (emotions !== undefined) entry.emotions = emotions;
    if (tags !== undefined) entry.tags = tags;
    if (aiInsight !== undefined)
      entry.aiInsight = encryptSensitiveFields({ aiInsight }).aiInsight;
    if (recommendation !== undefined)
      entry.recommendation = encryptSensitiveFields({ recommendation }).recommendation;
    if (question !== undefined)
      entry.question = encryptSensitiveFields({ question }).question;
    if (recommendedActivities !== undefined)
      entry.recommendedActivities = {
        wellness: recommendedActivities.wellness || [],
        natureSounds: recommendedActivities.natureSounds || [],
        games: recommendedActivities.games || [],
      };
    if (intensity !== undefined) entry.intensity = intensity;
    if (sentiment !== undefined) entry.sentiment = sentiment;

    await entry.save();

    return res.status(200).json({
      message: "Entry updated successfully",
      entry: decryptSensitiveFields(entry.toObject()),
    });
  } catch (error) {
    console.error("Error updating journal entry:", error);
    return res
      .status(500)
      .json({
        error: "Failed to update journal entry",
        details: String(error),
      });
  }
});

// Delete an entry
router.delete("/:id", async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const entry = await JournalEntry.findOneAndDelete({
      _id: id,
      userId: userObjectId,
    });

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    return res
      .status(500)
      .json({
        error: "Failed to delete journal entry",
        details: String(error),
      });
  }
});

// Archive/Unarchive an entry
router.patch("/:id/archive", async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.userId;
    const { id } = req.params;
    const { isArchived } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userObjectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : userId;

    const entry = await JournalEntry.findOneAndUpdate(
      { _id: id, userId: userObjectId },
      { isArchived: isArchived !== undefined ? isArchived : true },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    return res.status(200).json({
      message: `Entry ${isArchived ? "archived" : "unarchived"} successfully`,
      entry: entry.toObject(),
    });
  } catch (error) {
    console.error("Error archiving journal entry:", error);
    return res
      .status(500)
      .json({
        error: "Failed to archive journal entry",
        details: String(error),
      });
  }
});

module.exports = router;
