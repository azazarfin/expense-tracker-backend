const express = require('express');
const router = express.Router({ mergeParams: true });
const { deleteActivity } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/:activityId').delete(protect, admin, deleteActivity);

module.exports = router;