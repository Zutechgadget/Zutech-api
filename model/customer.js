import mongoose from 'mongoose';
import Joi from 'joi';

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, maxlength: 50 },
    isGold: { type: Boolean, default: false },
    phoneNumber: { type: String, required: true, minlength: 5, maxlength: 15 }
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        isGold: Joi.boolean(),
        phoneNumber: Joi.string().min(5).max(15).required()
    });

    return schema.validate(customer);
}

export { Customer, validateCustomer as validate };
