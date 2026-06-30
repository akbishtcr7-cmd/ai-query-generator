const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'VARCHAR' },
  isPrimary: { type: Boolean, default: false },
  isNullable: { type: Boolean, default: true },
}, { _id: false });

const tableSchema = new mongoose.Schema({
  tableName: { type: String, required: true },
  columns: [columnSchema],
  rowCount: { type: Number, default: 0 },
}, { _id: false });

const sandboxSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },           // e.g. "My Ecommerce DB"
  databaseType: { type: String, required: true },   // MySQL, PostgreSQL, etc.
  connectionMeta: {
    // We ONLY store schema info, never credentials
    host: String,
    port: Number,
    dbName: String,
    // NO password, NO username stored
  },
  tables: [tableSchema],
  // Virtual rows stored as JSON per table  { tableName -> [row, row, ...] }
  virtualData: { type: mongoose.Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true },
  sandboxPassword: { type: String }, // hashed — required for GRANT/DROP/ALTER ops
}, { timestamps: true });

module.exports = mongoose.model('Sandbox', sandboxSchema);
