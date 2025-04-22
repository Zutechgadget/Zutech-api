import express from 'express';
import { Category, validateCategory } from '../model/category.js';
import { authenticateAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// 🔒 Create a category (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) {
    console.log('Joi Validation Error:', error.details);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const category = new Category({ name: req.body.name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 📦 Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 📦 Get a category by ID (public)
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'The category with the given ID was not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('Error fetching category:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 🔒 Delete a category by ID (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }

  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'The category with the given ID was not found' });
    }
    res.json({ message: 'Category deleted', category });
  } catch (err) {
    console.error('Error deleting category:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;