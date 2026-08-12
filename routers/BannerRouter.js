import { Router } from 'express'
import { getBanner, updateBanner } from '../controllers/BannerController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
import { cacheResponse } from '../middleware/cacheMiddleware.js'
const router = Router(); router.get('/', cacheResponse(300), getBanner); router.put('/', protect, adminOnly, updateBanner); export default router
