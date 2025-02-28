import mongoose from 'mongoose';
import Joi from 'joi';

// Define Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 255 },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    ratings: { type: Number, default: 0, min: 0, max: 5 }
});

// Create Model
const Product = mongoose.model('Product', productSchema);

// Validate Product
function validateProduct(product) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        categoryId: Joi.string().required(), // ✅ Ensure it matches MongoDB schema
        stock: Joi.number().min(0).required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
        price: Joi.number().min(0).required(),
        ratings: Joi.number().min(0).max(5)
    });
    return schema.validate(product);
}

// Export using ES Modules
export { Product, validateProduct };
