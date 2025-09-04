const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Define the routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Add this new test route
router.get('/test', (req, res) => {
  res.send('Auth test route is working!');
});

module.exports = router;