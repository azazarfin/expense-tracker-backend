const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['ADD_BALANCE', 'REMOVE_BALANCE'],
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Chapter',
    },
  },
  {
    timestamps: true,
  }
);

// --- FIX: Add an index to the 'chapter' field for faster queries ---
activityLogSchema.index({ chapter: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);