const mongoose = require('mongoose');

const queryHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prompt: { type: String, required: true },
  databaseType: { type: String, required: true },
  generatedQuery: { type: String, required: true },
  description: { type: String },
  estimatedRows: { type: Number, default: 0 },
  complexity: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  performanceScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['SAFE', 'WARNING', 'CRITICAL'], default: 'SAFE' },
  requiresAdminApproval: { type: Boolean, default: false },
  optimizationSuggestions: [{ type: String }],
  explanation: {
    purpose: String,
    tablesInvolved: [String],
    conditionsUsed: [String],
    joinsUsed: [String],
    sortingLogic: String,
    aggregations: [String],
    groupingLogic: String,
  },
  isFavorite: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('QueryHistory', queryHistorySchema);
