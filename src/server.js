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
const activityRoutes = require('./routes/activityRoutes'); // 1. Import the new routes

dotenv.config();
connectDB();
const app = express();

// Define a list of allowed origins
const allowedOrigins = [
  'http://localhost:5173', // Your local frontend for development
  'https://expensetracker-azaz.vercel.app',
  'https://expense-tracker-frontend-git-main-azaz-arfins-projects.vercel.app' // Your deployed Vercel frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- CORRECTED ROUTE STRUCTURE ---
app.use('/api/chapters/:chapterId/transactions', transactionRoutes);
app.use('/api/chapters/:chapterId/users', userRoutes);
app.use('/api/chapters/:chapterId/stats', statsRoutes);
app.use('/api/chapters/:chapterId/history', historyRoutes);
app.use('/api/chapters/:chapterId/activities', activityRoutes); // 2. Use the new routes

// Standalone routes that are NOT chapter-specific
app.use('/api/auth', authRoutes);
app.use('/api/chapters', chapterRoutes);


const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});