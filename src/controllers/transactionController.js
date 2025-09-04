const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Membership = require('../models/membershipModel');
const Chapter = require('../models/chapterModel');
const User = require('../models/userModel');

/**
 * @desc    Create a new transaction in a chapter
 * @route   POST /api/chapters/:chapterId/transactions
 * @access  Private
 */
const createTransaction = asyncHandler(async (req, res) => {
  const { description, totalAmount, items, participants, creatorId } = req.body;
  const { chapterId } = req.params;

  if (!description || !totalAmount || !participants || participants.length === 0) {
    res.status(400);
    throw new Error('Missing required fields.');
  }

  const participantIdsForCheck = typeof participants[0] === 'object' 
    ? participants.map(p => p.userId) 
    : participants;
  
  const participantUsers = await User.find({ '_id': { $in: participantIdsForCheck } });
  
  if (participantUsers.some(user => user.role === 'admin')) {
    res.status(400);
    throw new Error('Admins cannot be participants in an expense.');
  }

  // --- FIX: The aggregation pipeline to check the central balance is now correct ---
  const centralBalanceResult = await Membership.aggregate([
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
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);
  const currentCentralBalance = centralBalanceResult.length > 0 ? centralBalanceResult[0].total : 0;

  if (currentCentralBalance - totalAmount < 0) {
    res.status(400);
    throw new Error('Transaction would make Central Balance negative.');
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let splitType = 'equal';
    let splitDetails = [];
    let participantIds = [];

    if (typeof participants[0] === 'object' && participants[0] !== null) {
      splitType = 'manual';
      const manualSum = participants.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(manualSum - totalAmount) > 0.01) { throw new Error('Sum of manual splits must equal total.'); }
      
      for (const p of participants) {
        await Membership.updateOne({ user: p.userId, chapter: chapterId }, { $inc: { balance: -p.amount } }, { upsert: true, session });
        await Chapter.updateOne({ _id: chapterId }, { $addToSet: { members: p.userId } }, { session });
        splitDetails.push({ user: p.userId, amount: p.amount });
      }
      participantIds = participants.map(p => p.userId);
    } else {
      splitType = 'equal';
      const share = totalAmount / participants.length;
      for (const userId of participants) {
        await Membership.updateOne({ user: userId, chapter: chapterId }, { $inc: { balance: -share } }, { upsert: true, session });
        await Chapter.updateOne({ _id: chapterId }, { $addToSet: { members: userId } }, { session });
        splitDetails.push({ user: userId, amount: share });
      }
      participantIds = participants;
    }

    let creator = req.user.id;
    if (req.user.role === 'admin' && creatorId) { creator = creatorId; }

    const transaction = await Transaction.create([{
      chapter: chapterId, description, totalAmount, items: items ? items.filter(item => item.name && item.price) : [],
      participants: participantIds, creator, splitType, splitDetails,
    }], { session });
    
    await session.commitTransaction();
    res.status(201).json(transaction[0]);
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message || 'Transaction failed.');
  } finally {
    session.endSession();
  }
});

const getTransactions = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  let transactions;
  if (req.user.role === 'admin') {
    transactions = await Transaction.find({ chapter: chapterId }).sort({ createdAt: -1 });
  } else {
    transactions = await Transaction.find({ chapter: chapterId, participants: req.user.id }).sort({ createdAt: -1 });
  }
  res.status(200).json(transactions);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const { chapterId, transactionId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOneAndDelete({ _id: transactionId, chapter: chapterId }, { session });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found in this chapter.');
    }

    for (const detail of transaction.splitDetails) {
      await Membership.updateOne({ user: detail.user, chapter: chapterId }, { $inc: { balance: detail.amount } }, { session });
    }

    await session.commitTransaction();
    res.status(200).json({ message: 'Transaction deleted and funds reverted.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message || 'Failed to delete transaction.');
  } finally {
    session.endSession();
  }
});


module.exports = {
  createTransaction,
  getTransactions,
  deleteTransaction,
};