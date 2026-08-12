import { Router } from 'express'
import { allOrders, createOrder, myOrders, updateOrderStatus } from '../controllers/OrderController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
const router = Router(); router.post('/', optionalUser, createOrder); router.get('/mine', protect, myOrders); router.get('/', protect, adminOnly, allOrders); router.patch('/:id/status', protect, adminOnly, updateOrderStatus); export default router
function optionalUser(req, _res, next) { if (!req.headers.authorization) return next(); return protect(req, _res, next) }
