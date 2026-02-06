const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");
const { authenticateToken } = require("../lib/auth-middleware");

// Initialize OpenAI client
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit for Whisper
    files: 1,
    fields: 10,
    fieldSize: 1024 * 1024, // 1MB for fields
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimes = [
      "audio/webm",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
      "audio/x-m4a",
      "audio/mp4",
      "audio/x-ms-wma",
      "application/octet-stream", // Fallback for some browsers
    ];

    if (allowedMimes.includes(file.mimetype) || !file.mimetype) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type: ${file.mimetype}. Only audio files are allowed.`
        ),
        false
      );
    }
  },
});

// Voice transcription endpoint (Whisper API)
// IMPORTANT: Multer must run BEFORE authentication to parse multipart form
router.post(
  "/transcribe",
  // Step 1: Parse multipart form with multer
  (req, res, next) => {
    upload.single("audio")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err);
        console.error("Multer error code:", err.code);
        console.error("Multer error field:", err.field);

        // Handle specific multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            error: "File too large",
            message:
              "Audio file exceeds 25MB limit. Please record a shorter audio clip.",
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            error: "Invalid file field",
            message: 'Please use the "audio" field name for the file upload.',
          });
        }

        if (err.message && err.message.includes("Invalid file type")) {
          return res.status(400).json({
            error: "Invalid file type",
            message: err.message,
          });
        }

        return res.status(400).json({
          error: "File upload error",
          message:
            err.message ||
            "Failed to upload audio file. Please check the file format and try again.",
        });
      }
      next();
    });
  },
  // Step 2: Authenticate after multer has parsed the form
  authenticateToken,
  // Step 3: Handle the transcription
  async (req, res) => {
    try {
      if (!openaiClient) {
        return res.status(500).json({
          error: "OpenAI API not configured",
          message: "Please set OPENAI_API_KEY in environment variables",
        });
      }

      // Validate file was uploaded
      if (!req.file) {
        console.error("No file in request");
        console.error("Request body:", req.body);
        console.error("Request files:", req.files);
        return res.status(400).json({
          error: "No audio file provided",
          message:
            'Please ensure you are sending the audio file with the field name "audio"',
        });
      }

      // Validate file has content
      if (!req.file.size || req.file.size === 0) {
        // Clean up empty file
        if (req.file.path) {
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).json({
          error: "Empty audio file",
          message:
            "The uploaded audio file is empty. Please record audio and try again.",
        });
      }

      console.log("📁 Received audio file:", {
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
      });

      console.log("🎤 Sending to OpenAI Whisper API...");

      // Validate file exists and is readable
      if (!fs.existsSync(req.file.path)) {
        return res.status(400).json({
          error: "File not found",
          message: "The uploaded file could not be found on the server.",
        });
      }

      // Call OpenAI Whisper API with file stream
      // OpenAI SDK v4 requires a File or Stream object, not buffer
      // Use createReadStream for proper file handling
      const transcription = await openaiClient.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-1",
        // Let Whisper auto-detect language for best results
      });

      // Validate transcription response
      if (!transcription || !transcription.text) {
        return res.status(500).json({
          error: "Invalid transcription response",
          message:
            "The transcription service returned an invalid response. Please try again.",
        });
      }

      console.log(
        "✅ Transcription successful:",
        transcription.text.substring(0, 100)
      );

      // Return response immediately for faster user experience
      const response = res.json({
        text: transcription.text,
        source: "Whisper",
      });

      // Clean up uploaded file asynchronously (don't block response)
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });

      return response;
    } catch (error) {
      console.error("Voice transcription error:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error status:", error.status);
      console.error("Error code:", error.code);

      // Log full error object for debugging
      if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
      }

      if (error.stack) {
        console.error("Error stack:", error.stack);
      }

      // Clean up file if it exists
      if (req.file?.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Failed to delete temp file:", err);
        });
      }

      // Handle OpenAI SDK v4 errors properly
      // Check for actual status code in error object
      const statusCode =
        error.status || error.response?.status || error.statusCode;
      const errorMessage =
        error.message ||
        error.response?.data?.error?.message ||
        "Unknown error";

      // Only return 429 if it's actually a rate limit error
      if (
        statusCode === 429 ||
        errorMessage.toLowerCase().includes("rate limit")
      ) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many requests to Whisper API. Please try again later.",
        });
      }

      // Handle 401 errors
      if (
        statusCode === 401 ||
        errorMessage.toLowerCase().includes("api key") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        return res.status(401).json({
          error: "Invalid OpenAI API key",
          message: "Please check your OPENAI_API_KEY configuration",
        });
      }

      // Handle other specific status codes
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return res.status(statusCode).json({
          error: "OpenAI API error",
          message: errorMessage,
          details:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }

      // Generic error handling - don't assume it's a rate limit
      return res.status(500).json({
        error: "Transcription failed",
        message:
          errorMessage ||
          "Failed to process voice transcription. Please check your API key and try again.",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);

module.exports = router;
