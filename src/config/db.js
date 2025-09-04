const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Mongoose.connect returns a promise, so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful, log the host name
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If there's an error, log it and exit the process
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit with a failure code
  }
};

module.exports = connectDB;
