const express = require('express');
const router = express.Router({ mergeParams: true }); // <-- FIX HERE
const { getCentralBalance } = require('../controllers/statsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/central-balance').get(protect, getCentralBalance);

module.exports = router;