import Review from '../models/Review.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { reviewResponse } from '../utils/serializers.js'

function validObjectId(value) {
  return typeof value === 'string' && mongoose.isObjectIdOrHexString(value)
}

export const listReviews = asyncHandler(async (req, res) => {
  const query = {}
  if (req.query.product_id) {
    if (!validObjectId(req.query.product_id)) return res.status(400).json({ message: 'Invalid product ID.' })
    query.productId = req.query.product_id
  }
  if (req.query.approved !== undefined) query.approved = req.query.approved === 'true'
  const reviews = await Review.find(query).populate('userId', 'fullName').populate('productId', 'name').sort({ createdAt: -1 })
  res.json({ reviews: reviews.map(reviewResponse) })
})
export const createReview = asyncHandler(async (req, res) => {
  const productId = req.body.product_id ?? req.body.productId; const rating = Number(req.body.rating); const comment = String(req.body.comment ?? '').trim()
  if (!validObjectId(productId)) return res.status(400).json({ message: 'Invalid product ID.' })
  if (!await Product.exists({ _id: productId })) return res.status(404).json({ message: 'Product not found.' })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || comment.length < 2) return res.status(400).json({ message: 'Please provide a rating and review comment.' })
  const review = await Review.create({ userId: req.user._id, productId, rating, comment }); await review.populate('userId', 'fullName'); await review.populate('productId', 'name')
  res.status(201).json({ message: 'Your review is awaiting approval.', review: reviewResponse(review) })
})
export const setReviewApproval = asyncHandler(async (req, res) => { if (!validObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' }); const review = await Review.findByIdAndUpdate(req.params.id, { approved: Boolean(req.body.approved) }, { returnDocument: 'after' }).populate('userId', 'fullName').populate('productId', 'name'); if (!review) return res.status(404).json({ message: 'Review not found.' }); res.json({ review: reviewResponse(review) }) })
export const deleteReview = asyncHandler(async (req, res) => { if (!validObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' }); const review = await Review.findByIdAndDelete(req.params.id); if (!review) return res.status(404).json({ message: 'Review not found.' }); res.status(204).end() })
