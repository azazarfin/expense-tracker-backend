const express = require('express');
const router = express.Router({ mergeParams: true }); // <-- FIX HERE
const { addBalance, getUsers, removeBalance, getMembershipProfile } = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// The rest of the file stays the same
router.route('/me/membership').get(protect, getMembershipProfile);
router.route('/').get(protect, admin, getUsers);
router.route('/:userId/add-balance').post(protect, admin, addBalance);
router.route('/:userId/remove-balance').post(protect, admin, removeBalance);

module.exports = router;