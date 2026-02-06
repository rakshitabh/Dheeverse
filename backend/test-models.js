// List available Gemini models
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ No API key found!");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // Try common model names
    const modelsToTry = [
      "gemini-pro",
      "gemini-1.5-pro",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro-latest",
      "gemini-2.0-flash-exp",
    ];

    console.log("🔍 Testing available Gemini models:\n");

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello'");
        const response = await result.response;
        const text = response.text();
        console.log(`✅ ${modelName}: WORKS - Response: "${text.trim()}"`);
      } catch (error) {
        console.log(`❌ ${modelName}: ${error.message.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

listModels();
