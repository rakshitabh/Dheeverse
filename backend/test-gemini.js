// Test Gemini API directly
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const testGemini = async () => {
  const apiKey = process.env.GEMINI_API_KEY;

  console.log("🔑 Testing Gemini API Key");
  console.log("API Key configured:", !!apiKey);
  console.log(
    "API Key (first 20 chars):",
    apiKey ? apiKey.substring(0, 20) + "..." : "Not found"
  );
  console.log("\n");

  if (!apiKey) {
    console.error("❌ No API key found in environment!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("📤 Sending test request to Gemini...\n");

    const prompt =
      'Return ONLY valid JSON with this structure: {"test": "success", "message": "Gemini is working"}';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini Response:");
    console.log(text);
    console.log("\n");

    // Try to parse JSON
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```\n?/g, "");
    }

    const parsed = JSON.parse(jsonText);
    console.log("✅ Parsed JSON:", parsed);
    console.log("\n🎉 Gemini API is working correctly!");
  } catch (error) {
    console.error("❌ Error testing Gemini:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Error response:", error.response);
    }
    if (error.stack) {
      console.error("\nStack trace:", error.stack);
    }
  }
};

testGemini();
