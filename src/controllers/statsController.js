const asyncHandler = require('express-async-handler');
const Membership = require('../models/membershipModel');
const mongoose = require('mongoose');

/**
 * @desc    Get central balance for a specific chapter
 * @route   GET /api/chapters/:chapterId/stats/central-balance
 * @access  Private
 */
const getCentralBalance = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  // --- FIX: New aggregation pipeline to join with users and filter out admins ---
  const stats = await Membership.aggregate([
    // 1. Find memberships for the current chapter
    { $match: { chapter: new mongoose.Types.ObjectId(chapterId) } },
    // 2. Join with the users collection to get user details
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    // 3. Unwind the userDetails array
    { $unwind: '$userDetails' },
    // 4. Filter to keep only documents where the user's role is 'member'
    { $match: { 'userDetails.role': 'member' } },
    // 5. Group the remaining members and sum their balances
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
  ]);

  res.status(200).json({ centralBalance: stats.length > 0 ? stats[0].totalBalance : 0 });
});

module.exports = {
  getCentralBalance,
};