import express from 'express';
import { Category, validateCategory } from '../model/category.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { error } = validateCategory(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    try {
        let category = new Category({ name: req.body.name });
        category = await category.save();
        res.send(category);
    } catch (err) {
        res.status(500).send('Server error: ' + err.message);
    }
});
// Get all categories
router.get("/", async (req, res) => {
    try {
      const categories = await Category.find();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Error fetching categories" });
    }
  });
  
router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(400).send('The category with the given ID was not found');
    res.send(category);
});

router.delete('/:id', async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(400).send('The category with the given ID was not found');
    res.send(category);
});

export default router;
