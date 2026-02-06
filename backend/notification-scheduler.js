// Notification Scheduler Service
// This service handles scheduled email notifications for journal reminders

let cron;
try {
  cron = require("node-cron");
} catch (error) {
  console.log(
    "⚠️  node-cron not installed. Automated email scheduling disabled."
  );
  console.log("   To enable: npm install node-cron");
}

const { connectToDatabase } = require("./lib/mongodb");
const User = require("./lib/models/User");
const JournalEntry = require("./lib/models/JournalEntry");
const { sendEmail } = require("./lib/email");

// Helper to check if user has journaled today
async function hasJournaledToday(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entry = await JournalEntry.findOne({
    userId: userId,
    createdAt: { $gte: today },
  });

  return !!entry;
}

// Send scheduled reminders at specific times
async function sendScheduledReminders() {
  try {
    await connectToDatabase();

    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const currentTime = `${currentHour
      .toString()
      .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

    console.log(`Checking for scheduled reminders at ${currentTime}...`);

    // Find all users who have scheduled reminders enabled at this time
    const users = await User.find({
      "settings.notifications.enabled": true,
      "settings.notifications.scheduledReminders": true,
      "settings.notifications.reminderTime": currentTime,
    });

    console.log(
      `Found ${users.length} users with reminders scheduled for ${currentTime}`
    );

    for (const user of users) {
      try {
        // Check if they've already journaled today
        const journaledToday = await hasJournaledToday(user._id);

        if (!journaledToday) {
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
              </style>
            </head>
            <body>
              <div class="header">
                <h1>🌟 DheeVerse Journal Reminder</h1>
                <p>It's ${currentTime} - Time to reflect!</p>
              </div>
              <div class="content">
                <h2>Hello ${user.name || "there"}!</h2>
                <p>This is your scheduled reminder to take a moment for yourself and journal about your day.</p>
                
                <p><strong>Just 5 minutes of reflection can:</strong></p>
                <ul>
                  <li>📊 Help you track emotional patterns</li>
                  <li>🧘‍♀️ Provide personalized wellness recommendations</li>
                  <li>💡 Give insights through AI analysis</li>
                  <li>🎯 Maintain your journaling streak</li>
                </ul>

                <center>
                  <a href="${
                    process.env.FRONTEND_URL || "http://localhost:3000"
                  }/journal/new" class="button">
                    Start Journaling Now →
                  </a>
                </center>
              </div>
              <div class="footer">
                <p>You're receiving this at ${currentTime} as per your scheduled reminder settings.</p>
                <p>To change notification preferences, visit <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/settings">Settings</a>.</p>
              </div>
            </body>
            </html>
          `;

          try {
            await sendEmail({ to: user.email, subject, html });
            console.log(`✓ Reminder sent to ${user.email} at ${currentTime}`);
          } catch (emailError) {
            console.error(
              `✗ Failed to send reminder email to ${user.email}:`,
              emailError.message
            );
            console.error("Full error:", emailError);
          }
        } else {
          console.log(
            `- User ${user.email} already journaled today, skipping reminder`
          );
        }
      } catch (error) {
        console.error(
          `Error processing reminder for ${user.email}:`,
          error.message
        );
        console.error("Full error:", error);
      }
    }
  } catch (error) {
    console.error("Error in sendScheduledReminders:", error);
  }
}

// Send weekly summaries (runs on Sundays)
async function sendWeeklySummaries() {
  try {
    await connectToDatabase();

    const today = new Date();
    const dayOfWeek = today.getDay();

    // Only run on Sundays
    if (dayOfWeek !== 0) {
      return;
    }

    console.log("Sending weekly summaries...");

    // Find all users with weekly summary enabled
    const users = await User.find({
      "settings.notifications.enabled": true,
      "settings.notifications.weeklySummary": true,
    });

    console.log(`Found ${users.length} users subscribed to weekly summaries`);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    for (const user of users) {
      try {
        // Get this week's entries
        const entries = await JournalEntry.find({
          userId: user._id,
          createdAt: { $gte: weekStart },
        });

        if (entries.length === 0) {
          console.log(
            `- User ${user.email} has no entries this week, skipping`
          );
          continue;
        }

        // Calculate stats
        const moods = entries.map((e) => e.mood).filter(Boolean);
        const moodCounts = moods.reduce((acc, mood) => {
          acc[mood] = (acc[mood] || 0) + 1;
          return acc;
        }, {});

        const topMood = Object.entries(moodCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];

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
            </style>
          </head>
          <body>
            <div class="header">
              <h1>📊 Your Weekly Summary</h1>
              <p>Week of ${weekStart.toLocaleDateString()}</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name || "there"}!</h2>
              <p>Great job staying consistent! Here's your week in review:</p>
              
              <div class="stat-card">
                <div class="stat-number">${entries.length}</div>
                <p><strong>Journal Entries</strong> this week</p>
              </div>

              ${
                topMood
                  ? `
              <div class="stat-card">
                <div class="stat-number">${topMood[0]}</div>
                <p><strong>Most Common Mood</strong></p>
              </div>
              `
                  : ""
              }

              <p><strong>Keep up the momentum!</strong> 🌟</p>
              <p>Regular journaling supports your mental wellness journey.</p>

              <center>
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/insights" class="button">
                  View Full Insights →
                </a>
              </center>
            </div>
          </body>
          </html>
        `;

        try {
          await sendEmail({ to: user.email, subject, html });
          console.log(`✓ Weekly summary sent to ${user.email}`);
        } catch (emailError) {
          console.error(
            `✗ Failed to send weekly summary email to ${user.email}:`,
            emailError.message
          );
          console.error("Full error:", emailError);
        }
      } catch (error) {
        console.error(
          `Error processing weekly summary for ${user.email}:`,
          error.message
        );
        console.error("Full error:", error);
      }
    }
  } catch (error) {
    console.error("Error in sendWeeklySummaries:", error);
  }
}

// Initialize scheduler
function initializeScheduler() {
  if (!cron) {
    console.log("ℹ️  Notification scheduler skipped - node-cron not installed");
    return;
  }

  console.log("🕐 Notification scheduler initialized");

  // Check for scheduled reminders every minute
  cron.schedule("* * * * *", () => {
    sendScheduledReminders();
  });

  // Send weekly summaries every Sunday at 9 AM
  cron.schedule("0 9 * * 0", () => {
    sendWeeklySummaries();
  });

  console.log("✓ Scheduled tasks configured:");
  console.log("  - Checking reminders every minute");
  console.log("  - Weekly summaries on Sundays at 9 AM");
}

// Export for use in server.js
module.exports = {
  initializeScheduler,
  sendScheduledReminders,
  sendWeeklySummaries,
};
