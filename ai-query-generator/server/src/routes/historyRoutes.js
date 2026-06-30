const router = require('express').Router();
const { getHistory, getHistoryById, deleteHistory, addFavorite, removeFavorite, getFavorites } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getHistory);
router.get('/favorites', getFavorites);
router.get('/:id', getHistoryById);
router.delete('/:id', deleteHistory);
router.post('/:id/favorite', addFavorite);
router.delete('/:id/favorite', removeFavorite);

module.exports = router;
