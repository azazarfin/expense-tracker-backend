const express = require('express');
const router = express.Router({ mergeParams: true }); // <-- FIX HERE
const { getCombinedHistory } = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getCombinedHistory);

module.exports = router;