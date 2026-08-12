import { Router } from 'express'
import multer from 'multer'
import { uploadImages } from '../controllers/UploadController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
const supportedTypes = /^image\/(jpeg|png|webp)$/
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 5 }, fileFilter: (_req, file, done) => {
  if (!supportedTypes.test(file.mimetype)) return done(new Error('Only JPG, PNG, and WebP images are allowed.'))
  done(null, true)
} })
const router = Router(); router.post('/', protect, adminOnly, upload.array('images', 5), uploadImages); export default router
