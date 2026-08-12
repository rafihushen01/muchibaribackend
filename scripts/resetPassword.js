import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const mongoUrl = process.env.MONGO_URL
  if (!mongoUrl) {
    console.error('MONGO_URL not set in environment. Set it and retry.')
    process.exit(1)
  }

  const identifier = process.argv[2]
  const newPassword = process.argv[3]
  if (!identifier || !newPassword) {
    console.error('Usage: node scripts/resetPassword.js <email|id> <newPassword>')
    process.exit(1)
  }

  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000 })
  console.log('Connected to MongoDB')

  const User = (await import('../models/User.js')).default

  const query = identifier.includes('@') ? { email: identifier.toLowerCase() } : { _id: identifier }
  const user = await User.findOne(query).select('+password')
  if (!user) {
    console.error('User not found for', identifier)
    await mongoose.disconnect()
    process.exit(1)
  }

  const hashed = await bcrypt.hash(String(newPassword), 12)
  user.password = hashed
  await user.save()
  console.log('Password updated for user:', user.email)

  await mongoose.disconnect()
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
