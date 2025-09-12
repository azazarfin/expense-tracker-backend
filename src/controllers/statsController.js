const asyncHandler = require('express-async-handler');
const Membership = require('../models/membershipModel');
const Transaction = require('../models/transactionModel');
const ActivityLog = require('../models/activityLogModel'); // Add this line
const mongoose = require('mongoose');

/**
 * @desc    Get central balance for a specific chapter
 * @route   GET /api/chapters/:chapterId/stats/central-balance
 * @access  Private
 */
const getCentralBalance = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;

  const stats = await Membership.aggregate([
    { $match: { chapter: new mongoose.Types.ObjectId(chapterId) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    { $unwind: '$userDetails' },
    { $match: { 'userDetails.role': 'member' } },
    { $group: { _id: null, totalBalance: { $sum: '$balance' } } },
  ]);

  res.status(200).json({ centralBalance: stats.length > 0 ? stats[0].totalBalance : 0 });
});

/**
 * @desc    Get total expenses for a chapter
 * @route   GET /api/chapters/:chapterId/stats/total-expenses
 * @access  Private
 */
const getTotalExpenses = asyncHandler(async (req, res) => {
    const { chapterId } = req.params;
    const stats = await Transaction.aggregate([
      { $match: { chapter: new mongoose.Types.ObjectId(chapterId) } },
      { $group: { _id: null, totalExpenses: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({ totalExpenses: stats.length > 0 ? stats[0].totalExpenses : 0 });
});

/**
 * @desc    Get fund details for a chapter
 * @route   GET /api/chapters/:chapterId/stats/fund-details
 * @access  Private
 */
const getFundDetails = asyncHandler(async (req, res) => {
    const { chapterId } = req.params;

    const fundDetails = await ActivityLog.aggregate([
        {
            $match: {
                chapter: new mongoose.Types.ObjectId(chapterId),
                type: 'ADD_BALANCE'
            }
        },
        {
            $group: {
                _id: '$targetUser',
                totalAdded: { $sum: '$amount' }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userDetails'
            }
        },
        { $unwind: '$userDetails' },
        {
            $project: {
                _id: 0,
                userId: '$_id',
                userName: '$userDetails.name',
                totalAdded: '$totalAdded'
            }
        },
        {
            $sort: {
                totalAdded: -1
            }
        }
    ]);

    res.status(200).json(fundDetails);
});


module.exports = {
  getCentralBalance,
  getTotalExpenses,
  getFundDetails,
};
