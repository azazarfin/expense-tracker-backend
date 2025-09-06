// Use 'require' consistently since the rest of the file uses it.
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

// Route files
const authRoutes = require('./routes/authRoutes');
const chapterRoutes = require('./routes/chapterRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const historyRoutes = require('./routes/historyRoutes');
const activityRoutes = require('./routes/activityRoutes');

dotenv.config();
connectDB();

const app = express(); // Define app once

// --- CORS CONFIGURATION ---
// Define a list of allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend for development
  'https://expensetracker-azaz.vercel.app',
  'https://expense-tracker-frontend-git-main-azaz-arfins-projects.vercel.app' // Your deployed Vercel frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or mobile apps)
    if (!origin) return callback(null, true);

    // If the origin is in our allowed list, allow it. Otherwise, block it.
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
};

// --- MIDDLEWARE ---
app.use(cors(corsOptions)); // Use the detailed corsOptions
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded


// --- ROUTES ---
// Nested routes that are chapter-specific
app.use('/api/chapters/:chapterId/transactions', transactionRoutes);
app.use('/api/chapters/:chapterId/users', userRoutes);
app.use('/api/chapters/:chapterId/stats', statsRoutes);
app.use('/api/chapters/:chapterId/history', historyRoutes);
app.use('/api/chapters/:chapterId/activities', activityRoutes);

// Standalone routes that are NOT chapter-specific
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);

// Add a root route for health check
app.get('/', (req, res) => {
  res.send('API is running...');
});


const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});