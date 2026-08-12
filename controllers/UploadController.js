import streamifier from 'streamifier'
import cloudinary from '../config/cloudinary.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])

function hasValidImageSignature(file) {
  const bytes = file.buffer
  if (!bytes || bytes.length < 12) return false
  if (file.mimetype === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
}

export const uploadImages = asyncHandler(async (req, res) => {
  if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) return res.status(503).json({ message: 'Cloudinary is not configured on the server.' })
  const files = req.files ?? []
  if (!files.length) return res.status(400).json({ message: 'Choose at least one JPG, PNG, or WebP image.' })
  if (files.some((file) => !imageTypes.has(file.mimetype) || !hasValidImageSignature(file))) return res.status(400).json({ message: 'Only valid JPG, PNG, or WebP images can be uploaded.' })
  const requestedFolder = typeof req.body.folder === 'string' ? req.body.folder : ''
  const folder = ['products', 'categories', 'banners'].includes(requestedFolder) ? `muchi-bari/${requestedFolder}` : 'muchi-bari/misc'
  const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ quality: 'auto', fetch_format: 'auto' }] }, (error, result) => error ? reject(error) : resolve({ url: result.secure_url, public_id: result.public_id }))
    streamifier.createReadStream(file.buffer).pipe(upload)
  })))
  res.status(201).json({ images })
})
