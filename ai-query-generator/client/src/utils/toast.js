// Simple toast utility (no external library needed)
export const toast = {
  success: (msg) => console.log('[SUCCESS]', msg),
  error: (msg) => console.error('[ERROR]', msg),
  info: (msg) => console.info('[INFO]', msg),
};
