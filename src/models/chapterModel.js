const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a chapter name'],
      trim: true,
    },
    // The user who created and owns this chapter (typically the admin)
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // We will also store a list of members for easy access
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chapter', chapterSchema);