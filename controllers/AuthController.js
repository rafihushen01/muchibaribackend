import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { publicUser } from '../utils/serializers.js'

function issueToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.')
  return jwt.sign({ sub: user.id, role: user.isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d', issuer: 'muchi-bari-api', audience: 'muchi-bari-web' })
}

export const register = asyncHandler(async (req, res) => {
  const fullName = String(req.body.full_name ?? req.body.fullName ?? '').trim()
  const email = String(req.body.email ?? '').trim().toLowerCase()
  const password = String(req.body.password ?? '')
  if (fullName.length < 2) return res.status(400).json({ message: 'Please enter your full name.' })
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Please enter a valid email address.' })
  if (password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' })
  if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' })
  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await User.create({ fullName, email, password: hashedPassword })
  res.status(201).json({ message: 'Account created successfully.', token: issueToken(user), user: publicUser(user) })
})

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email ?? '').trim().toLowerCase()
  const password = String(req.body.password ?? '')
  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Incorrect email or password.' })
  if (!user.isActive) return res.status(403).json({ message: 'This account has been disabled.' })
  res.json({ message: 'Signed in successfully.', token: issueToken(user), user: publicUser(user) })
})

export const me = asyncHandler(async (req, res) => res.json({ user: publicUser(req.user) }))

export const updateCredentials = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, email } = req.body
  const user = await User.findById(req.user.id).select('+password')
  if (!user) return res.status(404).json({ message: 'User not found.' })
  if (!currentPassword || !(await bcrypt.compare(String(currentPassword), user.password))) return res.status(400).json({ message: 'Your current password is incorrect.' })
  if (email) {
    const normalized = String(email).trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return res.status(400).json({ message: 'Please enter a valid email address.' })
    const other = await User.exists({ email: normalized, _id: { $ne: user.id } })
    if (other) return res.status(409).json({ message: 'An account with this email already exists.' })
    user.email = normalized
  }
  if (newPassword) {
    if (String(newPassword).length < 8 || String(newPassword).length > 128) return res.status(400).json({ message: 'New password must be between 8 and 128 characters.' })
    user.password = await bcrypt.hash(String(newPassword), 12)
  }
  await user.save()
  res.json({ message: 'Credentials updated.', token: issueToken(user), user: publicUser(user) })
})
