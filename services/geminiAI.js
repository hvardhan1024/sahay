const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDZWr2xH4m--aDvkSy_WVHrSn-hE9HLCw0');

// System prompt for the AI to act as a stress education assistant
const SYSTEM_PROMPT = `You are a compassionate and knowledgeable mental health educator assistant for students. Your role is to:

1. Provide accurate, helpful information about stress, anxiety, and mental wellness
2. Offer practical coping strategies and techniques
3. Be empathetic and supportive in your responses
4. Encourage professional help when appropriate
5. Keep responses concise but informative (2-3 paragraphs max)
6. Focus on evidence-based approaches
7. Never provide medical diagnoses or replace professional therapy

Always maintain a warm, supportive tone and remind users that while you can provide information and support, professional help should be sought for serious mental health concerns.`;

async function getAIResponse(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const fullPrompt = `${SYSTEM_PROMPT}\n\nUser question: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error('Gemini AI error:', error);

    // Fallback responses for common topics
    const fallbackResponses = {
      stress: "Stress is your body's natural response to challenges or demands. It can be helpful in small amounts, but chronic stress can affect your physical and mental health. Try deep breathing exercises, regular physical activity, and maintaining a consistent sleep schedule to help manage stress levels.",
      anxiety: "Anxiety is a feeling of worry, nervousness, or unease about something with an uncertain outcome. It's normal to feel anxious sometimes, but if it interferes with daily life, consider talking to a counselor. Techniques like mindfulness, progressive muscle relaxation, and grounding exercises can help manage anxiety symptoms.",
      study: "Academic stress is common among students. Break large tasks into smaller, manageable parts, create a study schedule, take regular breaks, and don't forget to maintain social connections. Remember that seeking help from teachers, tutors, or counselors is a sign of strength, not weakness."
    };

    // Simple keyword matching for fallback
    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(fallbackResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    return "I'm here to help you learn about stress management and mental wellness. While I'm having some technical difficulties right now, I encourage you to explore our resources section or connect with our community chat for support. Remember, it's always okay to reach out to a counselor or trusted adult when you need help.";
  }
}

module.exports = { getAIResponse };