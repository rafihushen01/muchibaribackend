import { Router } from 'express'
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from '../controllers/ProductController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
import { cacheResponse } from '../middleware/cacheMiddleware.js'
const router = Router(); router.get('/', cacheResponse(60), listProducts); router.get('/:id', cacheResponse(300), getProduct); router.post('/', protect, adminOnly, createProduct); router.patch('/:id', protect, adminOnly, updateProduct); router.delete('/:id', protect, adminOnly, deleteProduct); export default router
