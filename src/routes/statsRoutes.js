const express = require('express');
const router = express.Router({ mergeParams: true }); // <-- FIX HERE
const { getCentralBalance, getTotalExpenses, getFundDetails } = require('../controllers/statsController'); // Update this line
const { protect } = require('../middleware/authMiddleware');


router.route('/central-balance').get(protect, getCentralBalance);
router.route('/total-expenses').get(protect, getTotalExpenses);
router.route('/fund-details').get(protect, getFundDetails); // Add this line

module.exports = router;