import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

const email = String(process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
const password = String(process.env.ADMIN_PASSWORD ?? '')
const fullName = String(process.env.ADMIN_FULL_NAME ?? 'Muchi Bari Admin').trim()

if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
  throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 8 characters before running this script.')
}

await connectDB()
const hash = await bcrypt.hash(password, 12)
await User.findOneAndUpdate(
  { email },
  { $set: { fullName, password: hash, isAdmin: true, isActive: true } },
  { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
)
console.log(`Admin account is ready for ${email}`)
await User.db.close()
