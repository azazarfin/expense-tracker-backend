const express = require('express');
const router = express.Router({ mergeParams: true });
const {
  createTransaction,
  getTransactions,
  deleteTransaction,
} = require('../controllers/transactionController');

const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTransactions).post(protect, createTransaction);

// --- FIX: Change ':id' to ':transactionId' to match the controller ---
router.route('/:transactionId').delete(protect, admin, deleteTransaction);

module.exports = router;