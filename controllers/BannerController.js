import HeroBanner from '../models/HeroBanner.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { clearPublicCache } from '../middleware/cacheMiddleware.js'
import { revalidateHomepage } from '../utils/revalidate.js'

export const getBanner = asyncHandler(async (_req, res) => { const banner = await HeroBanner.findOne({ key: 'homepage' }); res.json({ banner }) })
export const updateBanner = asyncHandler(async (req, res) => {
  const updates = {}; if (req.body.mobile_image_url !== undefined || req.body.mobileImageUrl !== undefined) updates.mobileImageUrl = String(req.body.mobile_image_url ?? req.body.mobileImageUrl).trim(); if (req.body.desktop_image_url !== undefined || req.body.desktopImageUrl !== undefined) updates.desktopImageUrl = String(req.body.desktop_image_url ?? req.body.desktopImageUrl).trim()
  const banner = await HeroBanner.findOneAndUpdate({ key: 'homepage' }, { $set: updates, $setOnInsert: { key: 'homepage' } }, { returnDocument: 'after', upsert: true, runValidators: true })
  clearPublicCache()
  revalidateHomepage().catch(err => console.error('Revalidation failed:', err))
  res.json({ banner })
})
