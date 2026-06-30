const mongoose = require('mongoose');

const pendingQuerySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  databaseType: { type: String, required: true },
  generatedQuery: { type: String, required: true },
  riskLevel: { type: String, default: 'CRITICAL' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'modified'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  adminNotes: { type: String },
  modifiedQuery: { type: String },
  description: { type: String },
  optimizationSuggestions: [String],
}, { timestamps: true });

module.exports = mongoose.model('PendingQuery', pendingQuerySchema);
