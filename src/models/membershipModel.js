const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Chapter',
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Ensure a user can only be a member of a chapter once
membershipSchema.index({ user: 1, chapter: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);