const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Membership = require('../models/membershipModel');
const ActivityLog = require('../models/activityLogModel');
const Chapter = require('../models/chapterModel');
const mongoose = require('mongoose');

/**
 * @desc    Get all users (members only) for a specific chapter with their balances
 * @route   GET /api/chapters/:chapterId/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  // --- FIX: Fetch ONLY users with the role of 'member' ---
  const memberUsers = await User.find({ role: 'member' }, '-password').lean();

  // Find all memberships for the current chapter
  const memberships = await Membership.find({ chapter: chapterId }).lean();

  // Create a map of userId -> balance for efficient lookup
  const balanceMap = new Map(
    memberships.map(m => [m.user.toString(), m.balance])
  );

  // Combine the data, adding a balance of 0 if a member has no membership yet
  const usersWithBalances = memberUsers.map(user => ({
    ...user,
    balance: balanceMap.get(user._id.toString()) || 0,
  }));
  
  res.status(200).json(usersWithBalances);
});


/**
 * @desc    Get user's own membership profile for a chapter (for their balance)
 * @route   GET /api/chapters/:chapterId/users/me/membership
 * @access  Private
 */
const getMembershipProfile = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const membership = await Membership.findOne({ user: req.user.id, chapter: chapterId });

  if (membership) {
    res.status(200).json(membership);
  } else {
    // If no membership, the user has 0 balance in this chapter.
    // Return a virtual membership so the frontend doesn't error.
    res.status(200).json({
        user: req.user.id,
        chapter: chapterId,
        balance: 0
    });
  }
});

/**
 * @desc    Add balance to a user's account within a chapter
 * @route   POST /api/chapters/:chapterId/users/:userId/add-balance
 * @access  Private/Admin
 */
const addBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const { chapterId, userId } = req.params;

  const targetUser = await User.findById(userId);
  if (targetUser && targetUser.role === 'admin') {
    res.status(400);
    throw new Error('Cannot manage balance for an admin user.');
  }

  const membership = await Membership.findOneAndUpdate(
    { user: userId, chapter: chapterId },
    { $inc: { balance: Number(amount) } },
    { new: true, upsert: true, runValidators: true }
  );
  await Chapter.findByIdAndUpdate(chapterId, { $addToSet: { members: userId } });
  await ActivityLog.create({
    type: 'ADD_BALANCE',
    adminUser: req.user.id,
    targetUser: userId,
    amount: Number(amount),
    chapter: chapterId,
  });
  res.status(200).json(membership);
});

/**
 * @desc    Remove balance from a user's account within a chapter
 * @route   POST /api/chapters/:chapterId/users/:userId/remove-balance
 * @access  Private/Admin
 */
const removeBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const { chapterId, userId } = req.params;
  
  const targetUser = await User.findById(userId);
  if (targetUser && targetUser.role === 'admin') {
    res.status(400);
    throw new Error('Cannot manage balance for an admin user.');
  }

  const membership = await Membership.findOneAndUpdate(
    { user: userId, chapter: chapterId },
    { $inc: { balance: -Number(amount) } },
    { new: true, upsert: true, runValidators: true }
  );
  await Chapter.findByIdAndUpdate(chapterId, { $addToSet: { members: userId } });
  await ActivityLog.create({
    type: 'REMOVE_BALANCE',
    adminUser: req.user.id,
    targetUser: userId,
    amount: Number(amount),
    chapter: chapterId,
  });
  res.status(200).json(membership);
});

module.exports = {
  getUsers,
  addBalance,
  removeBalance,
  getMembershipProfile,
};