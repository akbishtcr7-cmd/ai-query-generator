const router = require('express').Router();
const { generate, formatQueryHandler, chat, getDashboardStats } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.AI_RATE_LIMIT_PER_MINUTE) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI requests. Please wait a minute and try again.',
  },
});

router.use(protect);
router.post('/generate', aiLimiter, generate);
router.post('/format', formatQueryHandler);
router.post('/chat', aiLimiter, chat);
router.get('/dashboard', getDashboardStats);

module.exports = router;
