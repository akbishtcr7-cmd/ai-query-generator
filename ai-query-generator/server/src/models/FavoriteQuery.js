const mongoose = require('mongoose');

const favoriteQuerySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  queryHistory: { type: mongoose.Schema.Types.ObjectId, ref: 'QueryHistory', required: true },
  collection: { type: String, default: 'Default' },
  notes: { type: String },
}, { timestamps: true });

favoriteQuerySchema.index({ user: 1, queryHistory: 1 }, { unique: true });

module.exports = mongoose.model('FavoriteQuery', favoriteQuerySchema);
