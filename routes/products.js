import express from 'express';
import { Product, validateProduct } from '../model/product.js';
import { Category } from '../model/category.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
    const products = await Product.find().sort('name');
    res.send(products);
});
router.post('/', async (req, res) => {

    // Validate categoryId format
    if (!mongoose.Types.ObjectId.isValid(req.body.categoryId)) {
        console.log("Invalid categoryId format:", req.body.categoryId);
        return res.status(400).send('Invalid categoryId format');
    }

    const { error } = validateProduct(req.body);
    if (error) {
        console.log("Joi Validation Error:", error.details);
        return res.status(400).send(error.details[0].message);
    }

    try {
        const category = await Category.findById(req.body.categoryId);
        if (!category) {
            console.log("Category Not Found:", req.body.categoryId);
            return res.status(400).send('Invalid category ID');
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

        res.send(populatedProduct);
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).send('Server error: ' + err.message);
    }
});


router.put('/:id', async (req, res) => {
    const { error } = validateProduct(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const product = await Product.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!product) return res.status(400).send("Product with the given ID not found");
    
    res.send(product);
});

router.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).send('The product with the given ID was not found');
    
    res.send(product);
});

router.delete('/:id', async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(400).send('The product with the given ID was not found');
    
    res.send(product);
});

export default router;
