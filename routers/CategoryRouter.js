import { Router } from 'express'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/CategoryController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
import { cacheResponse } from '../middleware/cacheMiddleware.js'
const router = Router(); router.get('/', cacheResponse(300), listCategories); router.post('/', protect, adminOnly, createCategory); router.patch('/:id', protect, adminOnly, updateCategory); router.delete('/:id', protect, adminOnly, deleteCategory); export default router
