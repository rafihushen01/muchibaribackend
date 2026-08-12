import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, minlength: 2, maxlength: 1000 },
  approved: { type: Boolean, default: false, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => { ret.id = ret._id.toString(); ret.user_id = ret.userId?.toString(); ret.product_id = ret.productId?.toString(); ret.created_at = ret.createdAt; ret.updated_at = ret.updatedAt; delete ret._id; delete ret.__v; delete ret.userId; delete ret.productId; delete ret.createdAt; delete ret.updatedAt; return ret } } })
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true })

export default mongoose.model('Review', reviewSchema)
