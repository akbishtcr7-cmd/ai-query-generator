const router = require('express').Router();
const { generate, formatQueryHandler, chat, getDashboardStats } = require('../controllers/queryController');
const { protect } = require('../middleware/authMiddleware');
const rateLimit = require('express-rate-limit');

const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: 'Rate limit exceeded' });

router.use(protect);
router.post('/generate', aiLimiter, generate);
router.post('/format', formatQueryHandler);
router.post('/chat', aiLimiter, chat);
router.get('/dashboard', getDashboardStats);

module.exports = router;
