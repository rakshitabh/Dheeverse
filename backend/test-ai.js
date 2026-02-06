// Test AI Wellness Endpoint
const testAIWellness = async () => {
  const testCases = [
    {
      text: "I'm feeling really happy and excited today! Everything is going great!",
      expected: "Happy",
    },
    {
      text: "I'm so stressed and overwhelmed with work. Can't handle the pressure.",
      expected: "Stressed/Overwhelmed",
    },
    {
      text: "Feeling anxious and worried about tomorrow's presentation.",
      expected: "Anxious",
    },
    {
      text: "I'm sad and down today. Nothing seems to be going right.",
      expected: "Sad",
    },
    {
      text: "So angry and frustrated with everything! This is too much!",
      expected: "Angry",
    },
  ];

  console.log("🧪 Testing AI Wellness Endpoint\n");
  console.log("=".repeat(60));

  for (const testCase of testCases) {
    console.log(`\n📝 Testing: "${testCase.text.substring(0, 50)}..."`);
    console.log(`Expected mood: ${testCase.expected}\n`);

    try {
      const response = await fetch("http://localhost:5000/api/ai-wellness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testCase.text }),
      });

      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status}`);
        continue;
      }

      const data = await response.json();

      console.log(`✅ Detected Mood: ${data.mood}`);
      console.log(`📊 Intensity: ${data.intensity || "N/A"}`);
      console.log(`🎯 Stress Level: ${data.stressLevel || "N/A"}`);
      console.log(`🏷️  Keywords: ${data.keywords?.join(", ") || "N/A"}`);
      console.log(`💭 Insight: ${data.insight?.substring(0, 80)}...`);
      console.log(
        `💡 Recommendation: ${data.recommendation?.substring(0, 80)}...`
      );
      console.log(`📦 Recommendation Type: ${data.recommendationType}`);
      console.log(`🔍 Source: ${data.source}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }

    console.log("-".repeat(60));
  }
};

// Run the test
testAIWellness().catch(console.error);
