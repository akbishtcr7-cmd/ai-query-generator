const bcrypt = require('bcryptjs');
const Sandbox = require('../models/Sandbox');
const AuditLog = require('../models/AuditLog');
const { successResponse, errorResponse } = require('../utils/responseHandler');
const {
  generateDummyRows,
  inferSchemaFromDescription,
  simulateQueryOnVirtualData,
  requiresSandboxPassword,
} = require('../services/sandboxService');

// ─── Create a new sandbox ─────────────────────────────────────────────────────
const createSandbox = async (req, res) => {
  try {
    const { name, databaseType, description, sandboxPassword, connectionMeta } = req.body;
    if (!name || !databaseType) return errorResponse(res, 'Name and database type are required', 400);

    // Infer schema from description using Gemini
    let tables = [];
    let virtualData = {};

    if (description) {
      const schema = await inferSchemaFromDescription(description, databaseType);
      tables = schema.tables || [];

      // Generate dummy rows for each table
      tables.forEach(t => {
        virtualData[t.tableName] = generateDummyRows(t.tableName, t.columns, t.rowCount || 10);
        t.rowCount = virtualData[t.tableName].length;
      });
    }

    // Hash sandbox password if provided
    let hashedPassword = null;
    if (sandboxPassword) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(sandboxPassword, salt);
    }

    const sandbox = await Sandbox.create({
      user: req.user._id,
      name,
      databaseType,
      connectionMeta: connectionMeta || {},
      tables,
      virtualData,
      sandboxPassword: hashedPassword,
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'SANDBOX_CREATED',
      ipAddress: req.ip,
      status: 'success',
      details: { sandboxId: sandbox._id, name, databaseType },
    });

    // Don't send raw virtualData in response (can be huge) — send summary
    const summary = { ...sandbox.toObject(), virtualData: undefined };
    summary.tableSummary = tables.map(t => ({
      tableName: t.tableName,
      columns: t.columns,
      rowCount: (virtualData[t.tableName] || []).length,
      sampleRows: (virtualData[t.tableName] || []).slice(0, 3),
    }));

    return successResponse(res, 'Sandbox created successfully', summary, 201);
  } catch (err) {
    console.error('createSandbox error:', err);
    return errorResponse(res, err.message || 'Failed to create sandbox', 500);
  }
};

// ─── Get all sandboxes for user ───────────────────────────────────────────────
const getSandboxes = async (req, res) => {
  try {
    const sandboxes = await Sandbox.find({ user: req.user._id, isActive: true })
      .select('-virtualData -sandboxPassword')
      .sort({ createdAt: -1 });
    return successResponse(res, 'Sandboxes', sandboxes);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Get a single sandbox with virtual data ───────────────────────────────────
const getSandbox = async (req, res) => {
  try {
    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id })
      .select('-sandboxPassword');
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    const tableSummary = sandbox.tables.map(t => ({
      tableName: t.tableName,
      columns: t.columns,
      rowCount: (sandbox.virtualData[t.tableName] || []).length,
      rows: sandbox.virtualData[t.tableName] || [],
    }));

    return successResponse(res, 'Sandbox details', { ...sandbox.toObject(), tableSummary, virtualData: undefined });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Add a table manually ─────────────────────────────────────────────────────
const addTable = async (req, res) => {
  try {
    const { tableName, columns, rowCount = 10 } = req.body;
    if (!tableName || !columns?.length) return errorResponse(res, 'Table name and columns required', 400);

    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id });
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    if (sandbox.tables.find(t => t.tableName === tableName)) {
      return errorResponse(res, 'Table already exists', 400);
    }

    const dummyRows = generateDummyRows(tableName, columns, rowCount);
    sandbox.tables.push({ tableName, columns, rowCount: dummyRows.length });
    sandbox.virtualData[tableName] = dummyRows;
    sandbox.markModified('virtualData');
    await sandbox.save();

    return successResponse(res, 'Table added', {
      tableName, columns,
      rowCount: dummyRows.length,
      sampleRows: dummyRows.slice(0, 5),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Simulate a query on the virtual sandbox ──────────────────────────────────
const simulateQuery = async (req, res) => {
  try {
    const { query, sandboxPassword } = req.body;
    if (!query) return errorResponse(res, 'Query is required', 400);

    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id });
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    // Check if this operation requires sandbox password
    if (requiresSandboxPassword(query)) {
      if (!sandboxPassword) {
        return res.status(403).json({
          success: false,
          requiresPassword: true,
          message: 'This operation requires your sandbox password to proceed',
        });
      }
      if (!sandbox.sandboxPassword) {
        return errorResponse(res, 'No sandbox password is set. Please update sandbox settings.', 403);
      }
      const match = await bcrypt.compare(sandboxPassword, sandbox.sandboxPassword);
      if (!match) {
        await AuditLog.create({
          user: req.user._id, action: 'SANDBOX_AUTH_FAILED',
          ipAddress: req.ip, status: 'failed',
          details: { sandboxId: sandbox._id, query },
        });
        return errorResponse(res, 'Incorrect sandbox password', 401);
      }
    }

    // Run simulation via Gemini (no real DB touched)
    const simulation = await simulateQueryOnVirtualData(
      query,
      sandbox.virtualData,
      sandbox.tables,
      sandbox.databaseType,
    );

    // If INSERT/UPDATE/DELETE — update the virtual data snapshot
    if (['INSERT', 'UPDATE', 'DELETE'].includes(simulation.simulationType) && simulation.afterSnapshot?.length) {
      const table = simulation.affectedTable;
      if (table && sandbox.virtualData[table] !== undefined) {
        if (simulation.simulationType === 'DELETE') {
          // Remove affected rows from virtual data
          const beforeIds = simulation.beforeSnapshot?.map(r => JSON.stringify(r)) || [];
          sandbox.virtualData[table] = (sandbox.virtualData[table] || [])
            .filter(r => !beforeIds.includes(JSON.stringify(r)));
        } else {
          sandbox.virtualData[table] = simulation.afterSnapshot;
        }
        if (simulation.simulationType === 'INSERT' && simulation.resultRows?.length) {
          sandbox.virtualData[table] = [...(sandbox.virtualData[table] || []), ...simulation.resultRows];
        }
        sandbox.markModified('virtualData');
        await sandbox.save();
      }
    }

    await AuditLog.create({
      user: req.user._id, action: 'SANDBOX_QUERY_SIMULATED',
      query, ipAddress: req.ip, status: 'success',
      details: {
        sandboxId: sandbox._id,
        simulationType: simulation.simulationType,
        rowsAffected: simulation.rowsAffected,
      },
    });

    return successResponse(res, 'Query simulated on virtual data', {
      simulation,
      sandboxName: sandbox.name,
      databaseType: sandbox.databaseType,
      note: '⚠️ This is a virtual simulation. Your real database was NOT affected.',
    });
  } catch (err) {
    console.error('simulateQuery error:', err);
    return errorResponse(res, err.message || 'Simulation failed', 500);
  }
};

// ─── Get virtual table data ───────────────────────────────────────────────────
const getTableData = async (req, res) => {
  try {
    const { tableName } = req.params;
    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id });
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    const tableInfo = sandbox.tables.find(t => t.tableName === tableName);
    if (!tableInfo) return errorResponse(res, 'Table not found in sandbox', 404);

    const rows = sandbox.virtualData[tableName] || [];
    return successResponse(res, `Table: ${tableName}`, {
      tableName,
      columns: tableInfo.columns,
      rows,
      rowCount: rows.length,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Reset virtual data (restore dummy data) ──────────────────────────────────
const resetVirtualData = async (req, res) => {
  try {
    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id });
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    // Regenerate dummy data for all tables
    const freshVirtualData = {};
    sandbox.tables.forEach(t => {
      freshVirtualData[t.tableName] = generateDummyRows(t.tableName, t.columns, 10);
    });
    sandbox.virtualData = freshVirtualData;
    sandbox.markModified('virtualData');
    await sandbox.save();

    return successResponse(res, 'Virtual data reset to fresh dummy data');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Delete sandbox ───────────────────────────────────────────────────────────
const deleteSandbox = async (req, res) => {
  try {
    await Sandbox.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    return successResponse(res, 'Sandbox deleted');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ─── Update sandbox password ──────────────────────────────────────────────────
const updateSandboxPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword) return errorResponse(res, 'New password is required', 400);

    const sandbox = await Sandbox.findOne({ _id: req.params.id, user: req.user._id });
    if (!sandbox) return errorResponse(res, 'Sandbox not found', 404);

    const salt = await bcrypt.genSalt(10);
    sandbox.sandboxPassword = await bcrypt.hash(newPassword, salt);
    await sandbox.save();

    return successResponse(res, 'Sandbox password updated');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = {
  createSandbox, getSandboxes, getSandbox,
  addTable, simulateQuery, getTableData,
  resetVirtualData, deleteSandbox, updateSandboxPassword,
};
