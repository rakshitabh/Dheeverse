// List available Gemini models via API
require("dotenv").config();

const listModels = async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ No API key found!");
    return;
  }

  console.log("📋 Listing available Gemini models...\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      const error = await response.text();
      console.error("❌ API Error:", error);
      return;
    }

    const data = await response.json();
    
    console.log("✅ Available models:\n");
    data.models.forEach(model => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`• ${model.name}`);
      }
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

listModels();
