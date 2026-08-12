import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, me, register, updateCredentials } from '../controllers/AuthController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { message: 'Too many attempts. Please try again in 15 minutes.' } })
router.post('/register', authLimit, register)
router.post('/login', authLimit, login)
router.get('/me', protect, me)
router.patch('/credentials', protect, authLimit, updateCredentials)
export default router
