const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    
    chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Chapter',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    splitType: {
      type: String,
      required: true,
      enum: ['equal', 'manual'],
      default: 'equal',
    },
    splitDetails: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// --- FIX: Add an index to the 'chapter' field for faster queries ---
transactionSchema.index({ chapter: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);