import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  address: String,
  city: String,
  items: [
    {
      name: String,
      price: Number,
      image: String,
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    default: "Pending",
  },
}, { timestamps: true });

export default mongoose.model("Order", OrderSchema);