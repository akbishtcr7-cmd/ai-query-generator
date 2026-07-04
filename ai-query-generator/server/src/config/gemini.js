const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGeminiClient = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const getGeminiModel = () => {
  const client = getGeminiClient();
 return client.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

module.exports = { getGeminiModel };
