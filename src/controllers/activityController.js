const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ActivityLog = require('../models/activityLogModel');
const Membership = require('../models/membershipModel');

/**
 * @desc    Delete a balance activity and revert funds
 * @route   DELETE /api/chapters/:chapterId/activities/:activityId
 * @access  Private/Admin
 */
const deleteActivity = asyncHandler(async (req, res) => {
  const { chapterId, activityId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const activity = await ActivityLog.findOneAndDelete(
      { _id: activityId, chapter: chapterId },
      { session }
    );

    if (!activity) {
      res.status(404);
      throw new Error('Activity log not found in this chapter.');
    }

    // Determine the amount to revert. If we are deleting an "ADD_BALANCE",
    // we must subtract the amount, and vice-versa.
    const amountToRevert = activity.type === 'ADD_BALANCE' ? -activity.amount : activity.amount;

    await Membership.updateOne(
      { user: activity.targetUser, chapter: chapterId },
      { $inc: { balance: amountToRevert } },
      { session }
    );

    await session.commitTransaction();
    res.status(200).json({ message: 'Activity deleted and balance reverted.' });
  } catch (error) {
    await session.abortTransaction();
    res.status(400);
    throw new Error(error.message || 'Failed to delete activity.');
  } finally {
    session.endSession();
  }
});

module.exports = {
  deleteActivity,
};