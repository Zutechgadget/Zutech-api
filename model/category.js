import mongoose from "mongoose";
import Joi from "joi";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,

  }


});

// Middleware to update the `updatedAt` field before saving
const Category = mongoose.model('Category', categorySchema)

function validateCategory(category){
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
       
    } )
    

    return schema.validate(category);
}

export { Category, validateCategory };