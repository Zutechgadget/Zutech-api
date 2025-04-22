import mongoose from 'mongoose';
import Joi from 'joi';

// Updated Mongoose schema to accept isAdmin field
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    balance: { type: Number, default: 0 }
});

const User = mongoose.model('User', userSchema);

// Updated validation to accept isAdmin field (optional, default is false)
function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required(),
        isAdmin: Joi.boolean(),
        phone: Joi.string().optional(),
        address: Joi.string().optional(),
    });

    return schema.validate(user);
}

export { User, validateUser };
