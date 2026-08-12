import User from '../models/User.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { publicUser } from '../utils/serializers.js'

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ['fullName', 'phone', 'address']
  const updates = {}
  for (const key of allowed) if (req.body[key] !== undefined) updates[key] = String(req.body[key]).trim()
  if (req.body.full_name !== undefined) updates.fullName = String(req.body.full_name).trim()
  if (updates.fullName !== undefined && updates.fullName.length < 2) return res.status(400).json({ message: 'Full name must be at least two characters.' })
  const user = await User.findByIdAndUpdate(req.user.id, updates, { returnDocument: 'after', runValidators: true })
  res.json({ message: 'Profile updated.', user: publicUser(user) })
})
