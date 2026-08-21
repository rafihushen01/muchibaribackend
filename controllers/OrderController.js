import Order from '../models/Order.js'
import Product from '../models/Product.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import OrderCounter from '../models/OrderCounter.js'

const DELIVERY_RATES = { wallet: { inside: 60, outside: 100 }, standard: { inside: 80, outside: 130 } }
const statusValues = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
function isWallet(product) { return product.categoryId?.name?.toLowerCase().includes('wallet') }

export const createOrder = asyncHandler(async (req, res) => {
  const rawItems = Array.isArray(req.body.items) ? req.body.items : []
  const phone = String(req.body.phone ?? '').trim()
  const address = String(req.body.address ?? '').trim()
  const guestName = String(req.body.guest_name ?? req.body.guestName ?? '').trim()
  const zone = req.body.delivery_zone === 'Outside Dhaka' || req.body.deliveryZone === 'Outside Dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'
  if (!rawItems.length || rawItems.length > 20) return res.status(400).json({ message: 'Your order must contain between 1 and 20 items.' })
  if (!phone || !address) return res.status(400).json({ message: 'Phone number and delivery address are required.' })
  if (!req.user && !guestName) return res.status(400).json({ message: 'Your name is required for a guest order.' })
  const ids = [...new Set(rawItems.map((item) => item.product_id ?? item.productId).filter(Boolean))]
  const products = await Product.find({ _id: { $in: ids }, inStock: true }).populate('categoryId', 'name')
  if (products.length !== ids.length) return res.status(400).json({ message: 'One or more products are unavailable.' })
  const productsById = new Map(products.map((product) => [product.id, product]))
  const items = rawItems.map((item) => {
    const product = productsById.get(String(item.product_id ?? item.productId))
    const quantity = Number(item.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw Object.assign(new Error('Each item quantity must be between 1 and 50.'), { statusCode: 400 })
    const size = String(item.size ?? '').trim(); const color = String(item.color ?? '').trim()
    const sizes = product.sizes ? product.sizes.split(',').map((value) => value.trim()) : []
    const colors = product.colors ? product.colors.split(',').map((value) => value.trim()) : []
    if (sizes.length && !sizes.includes(size)) throw Object.assign(new Error(`Select a valid size for ${product.name}.`), { statusCode: 400 })
    if (colors.length && !colors.includes(color)) throw Object.assign(new Error(`Select a valid color for ${product.name}.`), { statusCode: 400 })
    return { productId: product._id, productName: product.name, imageUrl: product.imageUrl, quantity, price: product.price, size, color }
  })
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const walletOnly = products.every(isWallet)
  const rates = walletOnly ? DELIVERY_RATES.wallet : DELIVERY_RATES.standard
  const deliveryCharge = zone === 'Inside Dhaka' ? rates.inside : rates.outside
  const counter = await OrderCounter.findOneAndUpdate(
    { key: 'orders' },
    { $inc: { sequence: 1 } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )
  const orderNumber = `order-${String(counter.sequence).padStart(2, '0')}`
  const order = await Order.create({ order_number: orderNumber, userId: req.user?._id ?? null, guestName: req.user ? null : guestName, phone, address, deliveryZone: zone, deliveryCharge, subtotal, total: subtotal + deliveryCharge, items })
  res.status(201).json({ message: 'Order placed successfully.', order })
})

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 })
  res.json({ orders })
})

export const allOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find().populate('userId', 'fullName').sort({ createdAt: -1 })
  res.json({ orders })
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status ?? '')
  if (!statusValues.includes(status)) return res.status(400).json({ message: 'Invalid order status.' })
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' }).populate('userId', 'fullName')
  if (!order) return res.status(404).json({ message: 'Order not found.' })
  res.json({ order })
})
