const express = require('express');
const router = express.Router();
const { createChapter, getChapters, addMemberToChapter } = require('../controllers/chapterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, createChapter).get(protect, getChapters);
router.route('/:chapterId/members').post(protect, admin, addMemberToChapter);

module.exports = router;