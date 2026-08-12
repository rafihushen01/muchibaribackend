import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Full name is required.'], trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  address: { type: String, trim: true, maxlength: 500, default: '' },
  isAdmin: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (_doc, ret) => { ret.id = ret._id.toString(); delete ret._id; delete ret.__v; delete ret.password; return ret } } })

export default mongoose.model('User', userSchema)
