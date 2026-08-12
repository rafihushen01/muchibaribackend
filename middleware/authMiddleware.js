import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null
    if (!token) return res.status(401).json({ message: 'Authentication is required.' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.sub).select('-password')
    if (!user || !user.isActive) return res.status(401).json({ message: 'Your account is unavailable.' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Your session is invalid or has expired.' })
  }
}

export function adminOnly(req, res, next) {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Admin access is required.' })
  next()
}
