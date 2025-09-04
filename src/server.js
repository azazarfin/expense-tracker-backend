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

app.use(cors()); 
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
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));