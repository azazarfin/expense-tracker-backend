const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose'); // <-- THIS LINE WAS MISSING
const Chapter = require('../models/chapterModel');
const Membership = require('../models/membershipModel');
const User = require('../models/userModel');

/**
 * @desc    Create a new chapter
 * @route   POST /api/chapters
 * @access  Private
 */
const createChapter = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Please provide a chapter name');
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Create the chapter
    const chapter = new Chapter({
      name,
      owner: req.user.id,
      members: [req.user.id], // The creator is the first member
    });
    await chapter.save({ session });

    // Create a membership for the owner in this new chapter
    await Membership.create([{
      user: req.user.id,
      chapter: chapter._id,
      balance: 0,
    }], { session });
    
    await session.commitTransaction();
    res.status(201).json(chapter);
  } catch (error) {
    await session.abortTransaction();
    res.status(500);
    throw new Error('Chapter creation failed');
  } finally {
    session.endSession();
  }
});

/**
 * @desc    Get chapters for the logged-in user
 * @route   GET /api/chapters
 * @access  Private
 */
const getChapters = asyncHandler(async (req, res) => {
  // --- FIX: Remove the filter to find ALL chapters ---
  const chapters = await Chapter.find({}).sort({ createdAt: -1 });
  res.status(200).json(chapters);
});

/**
 * @desc    Add a user to a chapter
 * @route   POST /api/chapters/:chapterId/members
 * @access  Private/Admin
 */
const addMemberToChapter = asyncHandler(async (req, res) => {
    // This function can be built out further if needed
    res.status(501).json({ message: 'Not implemented' });
});

module.exports = {
  createChapter,
  getChapters,
  addMemberToChapter,
};