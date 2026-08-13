import Category from '../models/Category.js'
import Product from '../models/Product.js'
import mongoose from 'mongoose'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { clearPublicCache } from '../middleware/cacheMiddleware.js'
import { revalidateHomepage } from '../utils/revalidate.js'
import { productResponse } from '../utils/serializers.js'

const fields = ['name', 'description', 'price', 'originalPrice', 'imageUrl', 'imageUrls', 'categoryId', 'sizes', 'colors', 'inStock', 'isHotDeal']
function normalize(body) {
  const value = { ...body }
  const alias = { original_price: 'originalPrice', image_url: 'imageUrl', image_urls: 'imageUrls', category_id: 'categoryId', in_stock: 'inStock', is_hot_deal: 'isHotDeal' }
  for (const [from, to] of Object.entries(alias)) if (body[from] !== undefined) value[to] = body[from]
  const out = {}
  for (const key of fields) if (value[key] !== undefined) out[key] = value[key]
  if (out.imageUrls && !Array.isArray(out.imageUrls)) out.imageUrls = []
  if (out.originalPrice === '') out.originalPrice = null
  return out
}

function validCategoryId(value) {
  return typeof value === 'string' && mongoose.isObjectIdOrHexString(value)
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const listProducts = asyncHandler(async (req, res) => {
  const query = {}
  if (req.query.in_stock !== undefined) query.inStock = req.query.in_stock === 'true'
  if (req.query.hot_deal !== undefined) query.isHotDeal = req.query.hot_deal === 'true'
  if (req.query.category) {
    const category = await Category.findOne({ slug: String(req.query.category) })
    if (!category) return res.json({ products: [] })
    query.categoryId = category._id
  }
  const searchTerm = typeof req.query.q === 'string' ? req.query.q.trim() : ''
  if (searchTerm) {
    query.name = { $regex: escapeRegex(searchTerm), $options: 'i' }
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100)
  const products = await Product.find(query).populate('categoryId', 'name slug').sort({ createdAt: -1 }).limit(limit)
  res.json({ products: products.map(productResponse) })
})

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name slug')
  if (!product) return res.status(404).json({ message: 'Product not found.' })
  res.json({ product: productResponse(product) })
})

export const createProduct = asyncHandler(async (req, res) => {
  const data = normalize(req.body)
  if (!data.name || data.price === undefined || !data.categoryId) return res.status(400).json({ message: 'Name, price, and category are required.' })
  if (!validCategoryId(data.categoryId)) return res.status(400).json({ message: 'Category must be a valid category ID.' })
  if (!await Category.exists({ _id: data.categoryId })) return res.status(400).json({ message: 'Selected category does not exist.' })
  const product = await Product.create(data)
  await product.populate('categoryId', 'name slug')
  clearPublicCache()
  revalidateHomepage().catch(err => console.error('Revalidation failed:', err))
  res.status(201).json({ product: productResponse(product) })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const data = normalize(req.body)
  if (data.categoryId !== undefined && !validCategoryId(data.categoryId)) return res.status(400).json({ message: 'Category must be a valid category ID.' })
  if (data.categoryId && !await Category.exists({ _id: data.categoryId })) return res.status(400).json({ message: 'Selected category does not exist.' })
  const product = await Product.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true }).populate('categoryId', 'name slug')
  if (!product) return res.status(404).json({ message: 'Product not found.' })
  clearPublicCache()
  revalidateHomepage().catch(err => console.error('Revalidation failed:', err))
  res.json({ product: productResponse(product) })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found.' })
  clearPublicCache()
  revalidateHomepage().catch(err => console.error('Revalidation failed:', err))
  res.status(204).end()
})
