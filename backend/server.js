const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import notification scheduler
const { initializeScheduler } = require("./notification-scheduler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/journal", require("./routes/journal"));
app.use("/api/voice", require("./routes/voice"));
app.use("/api/recommendations", require("./routes/recommendations"));
app.use("/api/notifications", require("./routes/notifications"));
// AI wellness assistant endpoint (analyzes journal text and returns mood + recommendation)
app.use("/api/ai-wellness", require("./routes/ai-wellness"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize notification scheduler
  initializeScheduler();
});

// Handle port conflicts gracefully
server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Please free the port or set a different PORT in .env`
    );
    console.error("To find and kill the process using port 5000, run:");
    console.error("Windows: netstat -ano | findstr :5000");
    console.error("Then: taskkill /PID <PID> /F");
    process.exit(1);
  } else {
    console.error("Server error:", err);
    process.exit(1);
  }
});
