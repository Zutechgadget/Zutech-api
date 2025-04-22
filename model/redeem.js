import mongoose from 'mongoose';

const redemptionInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  image: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const RedeemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  redemptionInfo: [redemptionInfoSchema]
});

export default mongoose.model('redeem', RedeemSchema);