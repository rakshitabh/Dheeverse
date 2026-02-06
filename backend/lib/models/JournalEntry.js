const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    mood: {
      type: String, // Can be numeric (1-5) or string (Happy, Sad, etc.)
      default: "Neutral",
    },
    emotions: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    entryType: {
      type: String,
      enum: ["text", "voice", "doodle"],
      default: "text",
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    // AI Analysis fields
    aiInsight: {
      type: String,
      default: null,
    },
    recommendation: {
      type: String,
      default: null,
    },
    recommendedActivities: {
      wellness: {
        type: [String],
        default: [],
      },
      natureSounds: {
        type: [String],
        default: [],
      },
      games: {
        type: [String],
        default: [],
      },
    },
    question: {
      type: String,
      default: null,
    },
    intensity: {
      type: Number,
      default: null,
    },
    stressLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: null,
    },
    keywords: {
      type: [String],
      default: [],
    },
    aiSource: {
      type: String,
      enum: ["AI", "Gemini", "OpenAI", "Fallback", "Manual"],
      default: null,
    },
    sentiment: {
      score: {
        type: Number,
        default: 0,
      },
      label: {
        type: String,
        enum: ["positive", "negative", "neutral"],
        default: "neutral",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient queries
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, isArchived: 1 });

module.exports =
  mongoose.models.JournalEntry ||
  mongoose.model("JournalEntry", journalEntrySchema);
