const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  supabaseId: { type: String, unique: true, sparse: true },  // Supabase UUID
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  role:       { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  avatar:     { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  totalQueries:  { type: Number, default: 0 },
  totalFavorites:{ type: Number, default: 0 },
  lastLogin:  { type: Date },
}, { timestamps: true });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
