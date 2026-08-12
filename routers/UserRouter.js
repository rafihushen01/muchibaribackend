import { Router } from 'express'
import { updateMe } from '../controllers/UserController.js'
import { protect } from '../middleware/authMiddleware.js'
const router = Router(); router.patch('/me', protect, updateMe); export default router
