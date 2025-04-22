import express from 'express';
import { Product, validateProduct } from '../model/product.js';
import { Category } from '../model/category.js';
import { authenticateAdmin } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// 📦 Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort('name').populate('categoryId', 'name');
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔒 Create a product (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  // Validate categoryId format
  if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
    console.log('Invalid categoryId format:', req.body.categoryId);
    return res.status(400).json({ error: 'Invalid categoryId format' });
  }

  const { error } = validateProduct(req.body);
  if (error) {
    console.log('Joi Validation Error:', error.details);
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      console.log('Category Not Found:', req.body.categoryId);
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const product = new Product({
      name: req.body.name,
      categoryId: req.body.categoryId,
      stock: req.body.stock,
      description: req.body.description,
      image: req.body.image,
      price: req.body.price,
      ratings: req.body.ratings
    });

    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id).populate('categoryId', 'name -_id');

    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 🔒 Update a product (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const { error } = validateProduct(req.body);
  if (error) {
    console.log('Joi Validation Error:', error.details);
    return res.status(400).json({ error: error.details[0].message });
  }

  if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
    console.log('Invalid categoryId format:', req.body.categoryId);
    return res.status(400).json({ error: 'Invalid categoryId format' });
  }

  try {
    const category = await Category.findById(req.body.categoryId);
    if (!category) {
      console.log('Category Not Found:', req.body.categoryId);
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        categoryId: req.body.categoryId,
        stock: req.body.stock,
        description: req.body.description,
        image: req.body.image,
        price: req.body.price,
        ratings: req.body.ratings
      },
      { new: true }
    ).populate('categoryId', 'name -_id');

    if (!product) {
      return res.status(404).json({ error: 'Product with the given ID not found' });
    }

    res.json(product);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 📦 Get a product by ID (public)
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name -_id');
    if (!product) {
      return res.status(404).json({ error: 'The product with the given ID was not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// 🔒 Delete a product by ID (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'The product with the given ID was not found' });
    }
    res.json({ message: 'Product deleted', product });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

export default router;