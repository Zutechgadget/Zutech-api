import express from 'express';
import { User } from '../model/user.js';
import Redeem from '../model/redeem.js';
import { authenticateAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Admin Dashboard Route (Protected)
router.get('/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const admins = await User.find({ isAdmin: true }).select('-password');
    const currentUser = await User.findById(req.user._id).select('name email isAdmin');
    res.json({
      message: 'Welcome to the Admin Dashboard',
      user: {
        _id: currentUser._id,
        name: currentUser.name || '',
        email: currentUser.email || '',
        isAdmin: currentUser.isAdmin || false
      },
      admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all redemption info for admin
router.get('/redemptionInfo', authenticateAdmin, async (req, res) => {
  try {
    const redemptionInfo = await Redeem.aggregate([
      { $unwind: { path: '$redemptionInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'redemptionInfo.userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $project: {
          _id: '$redemptionInfo._id',
          productId: '$_id',
          productName: '$name',
          userId: 'redemptionInfo.userId',
          userName: { $arrayElemAt: ['$userDetails.name', 0] },
          userEmail: { $arrayElemAt: ['$userDetails.email', 0] },
          amount: '$redemptionInfo.amount',
          image: '$redemptionInfo.image',
          status: '$redemptionInfo.status',
          reason: '$redemptionInfo.reason',
        },
      },
      { $match: { _id: { $exists: true } } }, // Filter out documents where redemptionInfo is null
    ]);

    res.json(redemptionInfo); // Return empty array if no redemption info
  } catch (err) {
    console.error('Error fetching redemption info:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Accept a redemption
router.post('/redemptionInfo/:redemptionId/accept', authenticateAdmin, async (req, res) => {
  try {
    const { redemptionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(redemptionId)) {
      return res.status(400).json({ error: 'Invalid redemption ID' });
    }

    const redeem = await Redeem.findOne({ 'redemptionInfo._id': redemptionId });
    if (!redeem) {
      return res.status(404).json({ error: 'Redemption info not found' });
    }

    const redemption = redeem.redemptionInfo.id(redemptionId);
    if (!redemption) {
      return res.status(404).json({ error: 'Redemption info not found' });
    }

    if (redemption.status === 'approved') {
      return res.status(400).json({ error: 'Redemption already approved' });
    }

    redemption.status = 'approved';
    redemption.reason = undefined;

    const user = await User.findById(redemption.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const amount = redemption.amount;
    user.balance = (user.balance || 0) + amount;
    await user.save();

    console.log(`Updated balance for user ${user._id}: +${amount} = ${user.balance}`);

    await redeem.save();

    res.json({ message: 'Redemption approved', newBalance: user.balance });
  } catch (err) {
    console.error('Error accepting redemption:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// Reject a redemption
router.post('/redemptionInfo/:redemptionId/reject', authenticateAdmin, async (req, res) => {
  try {
    const { redemptionId } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(redemptionId)) {
      return res.status(400).json({ error: 'Invalid redemption ID' });
    }

    const redeem = await Redeem.findOne({ 'redemptionInfo._id': redemptionId });
    if (!redeem) {
      return res.status(404).json({ error: 'Redemption info not found' });
    }

    const redemption = redeem.redemptionInfo.id(redemptionId);
    if (!redemption) {
      return res.status(404).json({ error: 'Redemption info not found' });
    }

    if (redemption.status === 'rejected') {
      return res.status(400).json({ error: 'Redemption already rejected' });
    }

    redemption.status = 'rejected';
    redemption.reason = reason || 'No reason provided';

    await redeem.save();

    res.json({ message: 'Redemption rejected', reason: redemption.reason });
  } catch (err) {
    console.error('Error rejecting redemption:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;