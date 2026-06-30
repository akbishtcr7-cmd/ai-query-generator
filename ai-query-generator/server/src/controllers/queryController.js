const { generateQuery, chatWithAI } = require('../services/geminiService');
const { analyzeRisk, detectSQLInjection } = require('../services/riskEngine');
const { formatQuery, minifyQuery, analyzeQueryStats } = require('../services/queryFormatter');
const QueryHistory = require('../models/QueryHistory');
const PendingQuery = require('../models/PendingQuery');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const generate = async (req, res) => {
  try {
    const { prompt, databaseType } = req.body;
    if (!prompt || !databaseType) return errorResponse(res, 'Prompt and database type are required', 400);

    // Injection detection
    if (detectSQLInjection(prompt)) {
      await AuditLog.create({
        user: req.user._id, action: 'QUERY_BLOCKED', query: prompt,
        ipAddress: req.ip, status: 'blocked', details: { reason: 'SQL injection detected' },
      });
      return errorResponse(res, 'Potential injection attempt detected', 400);
    }

    const aiResult = await generateQuery(prompt, databaseType);
    const riskAnalysis = analyzeRisk(aiResult.generatedQuery);

    if (riskAnalysis.isBlocked) {
      await AuditLog.create({
        user: req.user._id, action: 'QUERY_BLOCKED', query: aiResult.generatedQuery,
        databaseType, ipAddress: req.ip, status: 'blocked',
        details: { reason: riskAnalysis.blockedReason },
      });
      return errorResponse(res, `Blocked: ${riskAnalysis.blockedReason}`, 403);
    }

    const stats = analyzeQueryStats(aiResult.generatedQuery);
    const finalResult = {
      ...aiResult,
      riskLevel: riskAnalysis.riskLevel,
      requiresAdminApproval: riskAnalysis.requiresAdminApproval,
      ...stats,
    };

    // Save to history
    const history = await QueryHistory.create({
      user: req.user._id,
      prompt,
      databaseType,
      generatedQuery: aiResult.generatedQuery,
      description: aiResult.description,
      estimatedRows: aiResult.estimatedRows,
      complexity: aiResult.complexity || stats.complexity,
      performanceScore: aiResult.performanceScore,
      riskLevel: riskAnalysis.riskLevel,
      requiresAdminApproval: riskAnalysis.requiresAdminApproval,
      optimizationSuggestions: aiResult.optimizationSuggestions,
      explanation: aiResult.explanation,
    });

    // If critical, add to pending
    if (riskAnalysis.requiresAdminApproval) {
      await PendingQuery.create({
        user: req.user._id, prompt, databaseType,
        generatedQuery: aiResult.generatedQuery,
        riskLevel: riskAnalysis.riskLevel,
        description: aiResult.description,
        optimizationSuggestions: aiResult.optimizationSuggestions,
      });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { totalQueries: 1 } });

    await AuditLog.create({
      user: req.user._id, action: 'QUERY_GENERATED', query: aiResult.generatedQuery,
      databaseType, ipAddress: req.ip, status: 'success',
      riskLevel: riskAnalysis.riskLevel,
    });

    return successResponse(res, 'Query generated successfully', { ...finalResult, historyId: history._id });
  } catch (err) {
    console.error('Generate error:', err);
    return errorResponse(res, err.message || 'Failed to generate query', 500);
  }
};

const formatQueryHandler = async (req, res) => {
  try {
    const { query, databaseType, action } = req.body;
    if (!query) return errorResponse(res, 'Query is required', 400);

    let result;
    if (action === 'minify') result = minifyQuery(query);
    else result = formatQuery(query, databaseType);

    return successResponse(res, 'Query formatted', { formattedQuery: result });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const chat = async (req, res) => {
  try {
    const { messages, context } = req.body;
    if (!messages || !messages.length) return errorResponse(res, 'Messages are required', 400);

    const response = await chatWithAI(messages, context);
    return successResponse(res, 'AI response', { response });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalQueries, totalFavorites, dbUsage, complexityStats, recent] = await Promise.all([
      QueryHistory.countDocuments({ user: userId }),
      QueryHistory.countDocuments({ user: userId, isFavorite: true }),
      QueryHistory.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$databaseType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      QueryHistory.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$complexity', count: { $sum: 1 } } },
      ]),
      QueryHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(7).select('createdAt databaseType complexity'),
    ]);

    const mostUsedDb = dbUsage[0]?._id || 'N/A';

    // Daily trend last 7 days
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date.setHours(0, 0, 0, 0));
      const end = new Date(date.setHours(23, 59, 59, 999));
      const count = await QueryHistory.countDocuments({ user: userId, createdAt: { $gte: start, $lte: end } });
      trend.push({ date: start.toISOString().split('T')[0], count });
    }

    return successResponse(res, 'Dashboard stats', {
      totalQueries, totalFavorites, mostUsedDb,
      dbUsage, complexityStats, trend,
      aiRequests: totalQueries,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { generate, formatQueryHandler, chat, getDashboardStats };
