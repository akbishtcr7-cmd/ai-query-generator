const { getGeminiModel } = require('../config/gemini');
const { sanitizePrompt } = require('./riskEngine');

const SYSTEM_PROMPT = `You are an expert database query generator. Your role is to convert natural language descriptions into optimized database queries.

CRITICAL SECURITY RULES:
- NEVER generate queries that create/drop users, databases, or schemas
- NEVER generate GRANT, REVOKE, or privilege commands  
- NEVER include database credentials or connection strings
- NEVER execute or suggest executing queries directly

You MUST respond with ONLY valid JSON (no markdown, no explanation outside JSON) in this exact format:
{
  "databaseType": "string",
  "generatedQuery": "string",
  "description": "string",
  "estimatedRows": number,
  "complexity": "Low|Medium|High",
  "performanceScore": number (0-100),
  "riskLevel": "SAFE|WARNING|CRITICAL",
  "requiresAdminApproval": boolean,
  "optimizationSuggestions": ["string"],
  "explanation": {
    "purpose": "string",
    "tablesInvolved": ["string"],
    "conditionsUsed": ["string"],
    "joinsUsed": ["string"],
    "sortingLogic": "string",
    "aggregations": ["string"],
    "groupingLogic": "string"
  }
}`;

const generateQuery = async (prompt, databaseType) => {
  const sanitized = sanitizePrompt(prompt);
  const model = getGeminiModel();

  const userPrompt = `Generate a ${databaseType} query for the following requirement:
"${sanitized}"

Database Type: ${databaseType}
Return ONLY valid JSON, no markdown formatting.`;

  const result = await model.generateContent({
  contents: [
    { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] },
  ],
});
  const text = result.response.text().trim();
  
  // Strip markdown code blocks if present
  const jsonText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
  
  try {
    const parsed = JSON.parse(jsonText);
    parsed.databaseType = databaseType;
    return parsed;
  } catch {
    throw new Error('AI returned invalid JSON response. Please try again.');
  }
};

const chatWithAI = async (messages, context = '') => {
  const model = getGeminiModel();

  const systemContext = `You are a database expert AI assistant. Help users understand, optimize, and convert database queries. 
Be concise, accurate, and practical. Context: ${context}`;

  const prompt = systemContext + '\n\n' + messages.map(m => `${m.role}: ${m.content}`).join('\n');
  
  const result = await model.generateContent(prompt);
  return result.response.text();
};

module.exports = { generateQuery, chatWithAI };
