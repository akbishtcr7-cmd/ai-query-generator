const RESTRICTED_COMMANDS = [
  'CREATE USER', 'ALTER USER', 'DROP USER', 'CREATE ROLE', 'DROP ROLE', 'ALTER ROLE',
  'GRANT', 'REVOKE', 'DROP DATABASE', 'DROP SCHEMA', 'TRUNCATE DATABASE',
  'SUPERUSER', 'ROOT ACCESS', 'PRIVILEGE ESCALATION',
];

const CRITICAL_KEYWORDS = ['DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE'];
const WARNING_KEYWORDS = ['INSERT', 'UPDATE'];
const SAFE_KEYWORDS = ['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'WITH', 'FROM'];

const analyzeRisk = (query) => {
  if (!query) return { riskLevel: 'SAFE', requiresAdminApproval: false, blockedReason: null };

  const upperQuery = query.toUpperCase().trim();

  // Check restricted commands
  for (const cmd of RESTRICTED_COMMANDS) {
    if (upperQuery.includes(cmd)) {
      return {
        riskLevel: 'CRITICAL',
        requiresAdminApproval: true,
        blockedReason: `Restricted command detected: ${cmd}`,
        isBlocked: true,
      };
    }
  }

  // Check critical keywords
  for (const kw of CRITICAL_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`);
    if (regex.test(upperQuery)) {
      return { riskLevel: 'CRITICAL', requiresAdminApproval: true, blockedReason: null, isBlocked: false };
    }
  }

  // Check warning keywords
  for (const kw of WARNING_KEYWORDS) {
    const regex = new RegExp(`\\b${kw}\\b`);
    if (regex.test(upperQuery)) {
      return { riskLevel: 'WARNING', requiresAdminApproval: false, blockedReason: null, isBlocked: false };
    }
  }

  return { riskLevel: 'SAFE', requiresAdminApproval: false, blockedReason: null, isBlocked: false };
};

const sanitizePrompt = (prompt) => {
  // Remove potential injection patterns
  let sanitized = prompt
    .replace(/ignore previous instructions/gi, '')
    .replace(/system prompt/gi, '')
    .replace(/forget everything/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

  return sanitized.substring(0, 2000); // Limit length
};

const detectSQLInjection = (text) => {
  const patterns = [
    /(\bOR\b|\bAND\b)\s+[\w'"]+=[\w'"]+/i,
    /;\s*(DROP|DELETE|UPDATE|INSERT)\b/i,
    /UNION\s+SELECT/i,
    /1\s*=\s*1/,
    /'\s*OR\s*'1'\s*=\s*'1/i,
  ];
  return patterns.some(p => p.test(text));
};

module.exports = { analyzeRisk, sanitizePrompt, detectSQLInjection };
