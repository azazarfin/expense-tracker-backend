const asyncHandler = require('express-async-handler');
const Transaction = require('../models/transactionModel');
const ActivityLog = require('../models/activityLogModel');
const User = require('../models/userModel'); // Needed for populating user data

const getCombinedHistory = asyncHandler(async (req, res) => {
    const { chapterId } = req.params;

    // Fetch transactions for the chapter, populating necessary fields
    const transactions = await Transaction.find({ chapter: chapterId })
        .populate('creator', 'name')
        .populate('participants', 'name')
        .populate('splitDetails.user', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Fetch activity logs for the chapter
    const activities = await ActivityLog.find({ chapter: chapterId })
        .populate('adminUser', 'name')
        .populate('targetUser', 'name')
        .sort({ createdAt: -1 })
        .lean();

    // Format and combine both lists
    const formattedTransactions = transactions.map(t => ({
        _id: t._id,
        type: 'TRANSACTION',
        createdAt: t.createdAt,
        data: t,
    }));

    const formattedActivities = activities.map(a => ({
        _id: a._id,
        type: 'ACTIVITY',
        createdAt: a.createdAt,
        data: a,
    }));
    
    // Combine, sort by date descending, and send
    const combinedHistory = [...formattedTransactions, ...formattedActivities]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combinedHistory);
});

module.exports = { getCombinedHistory };