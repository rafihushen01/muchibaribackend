import Category from '../models/Category.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { clearPublicCache } from '../middleware/cacheMiddleware.js'

function slugify(value) { return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') }
export const listCategories = asyncHandler(async (_req, res) => res.json({ categories: await Category.find().sort({ name: 1 }) }))
export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name ?? '').trim(); const slug = slugify(req.body.slug || name)
  if (!name || !slug) return res.status(400).json({ message: 'Name and a valid slug are required.' })
  const category = await Category.create({ name, slug, imageUrl: String(req.body.image_url ?? req.body.imageUrl ?? '').trim() })
  clearPublicCache()
  res.status(201).json({ category })
})
export const updateCategory = asyncHandler(async (req, res) => {
  const data = {}; if (req.body.name !== undefined) data.name = String(req.body.name).trim(); if (req.body.slug !== undefined) data.slug = slugify(req.body.slug); if (req.body.image_url !== undefined || req.body.imageUrl !== undefined) data.imageUrl = String(req.body.image_url ?? req.body.imageUrl).trim()
  const category = await Category.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true }); if (!category) return res.status(404).json({ message: 'Category not found.' }); clearPublicCache(); res.json({ category })
})
export const deleteCategory = asyncHandler(async (req, res) => { if (await Product.exists({ categoryId: req.params.id })) return res.status(409).json({ message: 'Move or delete this category’s products first.' }); const category = await Category.findByIdAndDelete(req.params.id); if (!category) return res.status(404).json({ message: 'Category not found.' }); clearPublicCache(); res.status(204).end() })
