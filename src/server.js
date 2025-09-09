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
const allowedOrigins = [
  "https://expensetracker-azaz.vercel.app", // Your production frontend
  "http://localhost:5173", // For local development
];

const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin is in our allowed list or if it's a Vercel preview URL
    if (!origin || allowedOrigins.includes(origin) || /.vercel.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));


app.use(express.json());
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
