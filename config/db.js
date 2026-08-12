import mongoose from 'mongoose'
import dns from 'node:dns'

export async function connectDB() {
  const mongoUrl = process.env.MONGO_URL
  if (!mongoUrl) throw new Error('MONGO_URL is required')

  mongoose.set('strictQuery', true)
  // Atlas uses SRV records. This avoids broken router-provided DNS resolvers in local development.
  dns.setServers(['1.1.1.1', '8.8.8.8'])
  await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000 })
  console.log('MongoDB connected successfully')
}
