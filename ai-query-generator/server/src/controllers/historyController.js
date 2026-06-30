const QueryHistory = require('../models/QueryHistory');
const FavoriteQuery = require('../models/FavoriteQuery');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, databaseType, riskLevel, search } = req.query;
    const filter = { user: req.user._id };
    if (databaseType) filter.databaseType = databaseType;
    if (riskLevel) filter.riskLevel = riskLevel;
    if (search) filter.$or = [
      { prompt: { $regex: search, $options: 'i' } },
      { generatedQuery: { $regex: search, $options: 'i' } },
    ];

    const total = await QueryHistory.countDocuments(filter);
    const history = await QueryHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 'Query history', {
      history, total, page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getHistoryById = async (req, res) => {
  try {
    const history = await QueryHistory.findOne({ _id: req.params.id, user: req.user._id });
    if (!history) return errorResponse(res, 'Not found', 404);
    return successResponse(res, 'Query details', history);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteHistory = async (req, res) => {
  try {
    await QueryHistory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    return successResponse(res, 'History deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { collection = 'Default', notes } = req.body;

    const history = await QueryHistory.findOne({ _id: id, user: req.user._id });
    if (!history) return errorResponse(res, 'Query not found', 404);

    const existing = await FavoriteQuery.findOne({ user: req.user._id, queryHistory: id });
    if (existing) return errorResponse(res, 'Already in favorites', 400);

    await FavoriteQuery.create({ user: req.user._id, queryHistory: id, collection, notes });
    await QueryHistory.findByIdAndUpdate(id, { isFavorite: true });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalFavorites: 1 } });

    return successResponse(res, 'Added to favorites', null, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await FavoriteQuery.findOneAndDelete({ user: req.user._id, queryHistory: id });
    await QueryHistory.findByIdAndUpdate(id, { isFavorite: false });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalFavorites: -1 } });
    return successResponse(res, 'Removed from favorites');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getFavorites = async (req, res) => {
  try {
    const { collection } = req.query;
    const filter = { user: req.user._id };
    if (collection) filter.collection = collection;

    const favorites = await FavoriteQuery.find(filter)
      .populate('queryHistory')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Favorites', favorites);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { getHistory, getHistoryById, deleteHistory, addFavorite, removeFavorite, getFavorites };
