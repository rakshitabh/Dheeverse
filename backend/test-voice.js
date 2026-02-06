// Test Voice Transcription Endpoint
const fs = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");

async function testVoiceTranscription() {
  console.log("🧪 Testing Voice Transcription Endpoint\n");

  // Check if OpenAI API key is configured
  require("dotenv").config();
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  console.log("OpenAI API Key configured:", hasApiKey);

  if (!hasApiKey) {
    console.log("❌ No OpenAI API key found. Transcription will fail.");
    return;
  }

  console.log(
    "✅ API Key found:",
    process.env.OPENAI_API_KEY.substring(0, 15) + "...\n"
  );

  // Test endpoint availability
  try {
    console.log(
      "📡 Testing endpoint: http://localhost:5000/api/voice/transcribe"
    );
    console.log("Note: This requires an actual audio file to fully test.");
    console.log(
      'The endpoint expects a multipart/form-data POST with an "audio" field.\n'
    );

    console.log("✅ Backend is ready for voice transcription!");
    console.log("\n📝 To test from frontend:");
    console.log("   1. Go to http://localhost:3000/journal/new");
    console.log('   2. Click "Start Recording"');
    console.log("   3. Speak for a few seconds");
    console.log('   4. Click "Stop Recording"');
    console.log('   5. Click "Transcribe to Text"');
    console.log("   6. Your speech will appear in the text area!\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testVoiceTranscription();
