import mongoose from 'mongoose'

const heroBannerSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'homepage' },
  mobileImageUrl: { type: String, trim: true, default: '' },
  desktopImageUrl: { type: String, trim: true, default: '' },
}, { timestamps: true, toJSON: { transform: (_doc, ret) => { ret.id = '1'; ret.mobile_image_url = ret.mobileImageUrl; ret.desktop_image_url = ret.desktopImageUrl; ret.updated_at = ret.updatedAt; delete ret._id; delete ret.__v; delete ret.key; delete ret.mobileImageUrl; delete ret.desktopImageUrl; delete ret.createdAt; delete ret.updatedAt; return ret } } })

export default mongoose.model('HeroBanner', heroBannerSchema)
