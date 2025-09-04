const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'], // Field is required
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true, // Each email must be unique in the database
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ], // Ensures the email is a valid format
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['member', 'admin'], // The role can only be 'member' or 'admin'
      default: 'member', // New users are 'member' by default
    },
  },
  {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  }
);

// Export the model
module.exports = mongoose.model('User', userSchema);
