const express = require('express');
const router = express.Router({ mergeParams: true }); // Allows access to chapterId from the parent route
const { deleteActivity } = require('../controllers/activityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Maps DELETE /api/chapters/:chapterId/activities/:activityId to the deleteActivity controller
router.route('/:activityId').delete(protect, admin, deleteActivity);

module.exports = router;