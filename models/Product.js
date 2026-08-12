import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 180, index: true },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, min: 0, default: null },
  imageUrl: { type: String, trim: true, default: '' },
  imageUrls: { type: [String], default: [] },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  sizes: { type: String, trim: true, maxlength: 300, default: '' },
  colors: { type: String, trim: true, maxlength: 300, default: '' },
  inStock: { type: Boolean, default: true, index: true },
  isHotDeal: { type: Boolean, default: false, index: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => {
  // `categoryId` is an object after populate(). Calling String() on that
  // plain object produces "[object Object]", which breaks the next update.
  const category = ret.categoryId
  const categoryId = category && typeof category === 'object'
    ? category._id ?? category.id
    : category
  ret.id = ret._id.toString(); ret.image_url = ret.imageUrl; ret.image_urls = ret.imageUrls; ret.category_id = categoryId ? String(categoryId) : ''; ret.original_price = ret.originalPrice; ret.in_stock = ret.inStock; ret.is_hot_deal = ret.isHotDeal; delete ret._id; delete ret.__v; delete ret.imageUrl; delete ret.imageUrls; delete ret.categoryId; delete ret.originalPrice; delete ret.inStock; delete ret.isHotDeal; return ret
} } })
productSchema.index({ name: 'text' })

export default mongoose.model('Product', productSchema)
