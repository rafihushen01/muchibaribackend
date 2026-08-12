import { Router } from 'express'
import { createReview, deleteReview, listReviews, setReviewApproval } from '../controllers/ReviewController.js'
import { adminOnly, protect } from '../middleware/authMiddleware.js'
const router = Router(); router.get('/', listReviews); router.post('/', protect, createReview); router.patch('/:id/approval', protect, adminOnly, setReviewApproval); router.delete('/:id', protect, adminOnly, deleteReview); export default router
