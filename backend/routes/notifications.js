const express = require("express");
const router = express.Router();
const { connectToDatabase } = require("../lib/mongodb");
const User = require("../lib/models/User");
const { authenticateToken } = require("../lib/auth-middleware");
const { sendEmail } = require("../lib/email");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Send scheduled journal reminder email
router.post("/send-reminder", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if notifications are enabled (allow test even if scheduled reminders not enabled)
    if (!user.settings?.notifications?.enabled) {
      return res.status(400).json({ error: "Notifications are not enabled" });
    }

    const reminderTime = user.settings.notifications.reminderTime || "21:30";

    // Send email
    const subject = "DheeVerse - Time to Journal! 📝";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 DheeVerse Journal Reminder</h1>
          <p>It's time to reflect on your day</p>
        </div>
        <div class="content">
          <div class="emoji">📝</div>
          <h2>Hello ${user.name || "there"}!</h2>
          <p>This is your scheduled reminder at <strong>${reminderTime}</strong> to take a moment for yourself and journal about your day.</p>
          
          <p><strong>Why journal today?</strong></p>
          <ul>
            <li>📊 Track your emotional patterns</li>
            <li>🧘‍♀️ Get personalized wellness recommendations</li>
            <li>💡 Gain insights from AI analysis</li>
            <li>🎯 Maintain your journaling streak</li>
          </ul>

          <p>Taking just 5 minutes to reflect can make a significant difference in your mental well-being.</p>

          <center>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/journal/new" class="button">
              Start Journaling Now →
            </a>
          </center>
        </div>
        <div class="footer">
          <p>You're receiving this because you enabled scheduled reminders in your DheeVerse settings.</p>
          <p>To change your notification preferences, visit your <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/settings">Settings</a>.</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({ to: user.email, subject, html });

    return res.status(200).json({
      message: "Reminder email sent successfully",
      sentTo: user.email,
      reminderTime: reminderTime,
    });
  } catch (error) {
    console.error("Error sending reminder email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return res.status(500).json({
      error: "Failed to send reminder email",
      details: error.message,
    });
  }
});

// Send weekly summary email
router.post("/send-weekly-summary", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;
    const { entriesCount, moods, topEmotion } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if notifications are enabled (allow test even if weekly summary not enabled)
    if (!user.settings?.notifications?.enabled) {
      return res.status(400).json({ error: "Notifications are not enabled" });
    }

    // Send email
    const subject = "DheeVerse - Your Weekly Journal Summary 📊";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #667eea;
          }
          .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Your Weekly Summary</h1>
          <p>Here's how your week went</p>
        </div>
        <div class="content">
          <h2>Hello ${user.name || "there"}!</h2>
          <p>Great job staying consistent with your journaling! Here's a summary of your week:</p>
          
          <div class="stat-card">
            <div class="stat-number">${entriesCount || 0}</div>
            <p><strong>Journal Entries</strong> this week</p>
          </div>

          ${
            topEmotion
              ? `
          <div class="stat-card">
            <div class="stat-number">${topEmotion}</div>
            <p><strong>Most Common Mood</strong></p>
          </div>
          `
              : ""
          }

          <p><strong>Keep up the momentum!</strong> 🌟</p>
          <p>Regular journaling helps you understand your emotional patterns and supports your mental wellness journey.</p>

          <center>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/insights" class="button">
              View Full Insights →
            </a>
          </center>
        </div>
        <div class="footer">
          <p>You're receiving this weekly summary because you enabled it in your DheeVerse settings.</p>
          <p>To change your notification preferences, visit your <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/settings">Settings</a>.</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({ to: user.email, subject, html });

    return res.status(200).json({
      message: "Weekly summary email sent successfully",
      sentTo: user.email,
    });
  } catch (error) {
    console.error("Error sending weekly summary email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return res.status(500).json({
      error: "Failed to send weekly summary email",
      details: error.message,
    });
  }
});

// Test endpoint to manually trigger scheduled reminder
router.post("/test-scheduled-reminder", async (req, res) => {
  try {
    await connectToDatabase();
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if notifications are enabled
    if (!user.settings?.notifications?.enabled) {
      return res.status(400).json({ error: "Notifications are not enabled" });
    }

    // Check if scheduled reminders are enabled
    if (!user.settings?.notifications?.scheduledReminders) {
      return res.status(400).json({ error: "Scheduled reminders are not enabled" });
    }

    const reminderTime = user.settings.notifications.reminderTime || "21:30";

    // Send email
    const subject = "DheeVerse - Time to Journal! 📝";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .content {
            background: #f9fafb;
            padding: 30px;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 14px;
          }
          .emoji {
            font-size: 48px;
            margin: 20px 0;
          }
          .test-badge {
            display: inline-block;
            background: #fbbf24;
            color: #78350f;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌟 DheeVerse Journal Reminder</h1>
          <p>It's ${reminderTime} - Time to reflect!</p>
          <div class="test-badge">TEST EMAIL</div>
        </div>
        <div class="content">
          <div class="emoji">📝</div>
          <h2>Hello ${user.name || "there"}!</h2>
          <p>This is a test of your scheduled reminder at <strong>${reminderTime}</strong>. Take a moment for yourself and journal about your day.</p>
          
          <p><strong>Why journal today?</strong></p>
          <ul>
            <li>📊 Track your emotional patterns</li>
            <li>🧘‍♀️ Get personalized wellness recommendations</li>
            <li>💡 Gain insights from AI analysis</li>
            <li>🎯 Maintain your journaling streak</li>
          </ul>

          <p>Taking just 5 minutes to reflect can make a significant difference in your mental well-being.</p>

          <center>
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:3000"
            }/journal/new" class="button">
              Start Journaling Now →
            </a>
          </center>
        </div>
        <div class="footer">
          <p>This is a test email to verify your scheduled reminder settings are working.</p>
          <p>To change your notification preferences, visit your <a href="${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/settings">Settings</a>.</p>
        </div>
      </body>
      </html>
    `;

    await sendEmail({ to: user.email, subject, html });

    return res.status(200).json({
      message: "Test scheduled reminder email sent successfully",
      sentTo: user.email,
      reminderTime: reminderTime,
    });
  } catch (error) {
    console.error("Error sending test scheduled reminder email:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      response: error.response,
    });
    return res.status(500).json({
      error: "Failed to send test scheduled reminder email",
      details: error.message,
    });
  }
});

module.exports = router;
