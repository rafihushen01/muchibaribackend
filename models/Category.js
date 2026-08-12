import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  imageUrl: { type: String, trim: true, default: '' },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => { ret.id = ret._id.toString(); ret.image_url = ret.imageUrl; delete ret._id; delete ret.__v; delete ret.imageUrl; return ret } } })

export default mongoose.model('Category', categorySchema)
