import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1, max: 50 },
  price: { type: Number, required: true, min: 0 },
  size: { type: String, trim: true, maxlength: 50, default: '' },
  color: { type: String, trim: true, maxlength: 50, default: '' },
}, { _id: true, toJSON: { transform: (_doc, ret) => { ret.id = ret._id.toString(); ret.product_id = ret.productId?.toString(); ret.products = { id: ret.productId?.toString(), name: ret.productName, image_url: ret.imageUrl }; delete ret._id; delete ret.productId; delete ret.productName; delete ret.imageUrl; return ret } } })

const orderSchema = new mongoose.Schema({
  order_number: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  guestName: { type: String, trim: true, maxlength: 100, default: null },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  address: { type: String, required: true, trim: true, maxlength: 1000 },
  deliveryZone: { type: String, enum: ['Inside Dhaka', 'Outside Dhaka'], required: true },
  deliveryCharge: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending', index: true },
  items: { type: [orderItemSchema], validate: [(items) => items.length > 0, 'An order needs at least one item.'] },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => { ret.id = ret._id.toString(); ret.user_id = ret.userId?.toString() ?? null; ret.guest_name = ret.guestName; ret.is_guest = !ret.userId; ret.delivery_zone = ret.deliveryZone; ret.delivery_charge = ret.deliveryCharge; ret.order_items = ret.items; ret.created_at = ret.createdAt; ret.updated_at = ret.updatedAt; if (ret.userId && typeof ret.userId === 'object') ret.profiles = { full_name: ret.userId.fullName }; delete ret._id; delete ret.__v; delete ret.userId; delete ret.guestName; delete ret.deliveryZone; delete ret.deliveryCharge; delete ret.subtotal; delete ret.items; delete ret.createdAt; delete ret.updatedAt; return ret } } })

export default mongoose.model('Order', orderSchema)
