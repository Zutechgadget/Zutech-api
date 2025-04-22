import express from 'express';
import Order from '../model/order.js';
import { authenticate, authenticateAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { address, city, items, totalAmount, status } = req.body;
    if (!address || !city || !items || !totalAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newOrder = new Order({
      userId: req.user._id,
      address,
      city,
      items,
      totalAmount,
      status: status || 'Pending'
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order created', order: newOrder });
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

router.put('/:id/approve', authenticateAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid order ID' });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    ).populate('userId', 'name email');
    if (!order) {
      return res.status(404).json({ error: 'Order with the given ID not found' });
    }
    console.log(`Order ${req.params.id} approved by admin ${req.user._id}`);
    res.json({ message: 'Order approved', order });
  } catch (err) {
    console.error('Error approving order:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;