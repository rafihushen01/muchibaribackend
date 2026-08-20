import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { connectDB } from './config/db.js'
import authRouter from './routers/AuthRouter.js'
import userRouter from './routers/UserRouter.js'
import productRouter from './routers/ProductRouter.js'
import categoryRouter from './routers/CategoryRouter.js'
import orderRouter from './routers/OrderRouter.js'
import reviewRouter from './routers/ReviewRouter.js'
import bannerRouter from './routers/BannerRouter.js'
import uploadRouter from './routers/UploadRouter.js'
import { errorHandler, notFound } from './middleware/errorMiddleware.js'
// just test
dotenv.config()

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const allowedOrigins = (process.env.CLIENT_URL ?? 'http://localhost:3000').split(',').map((origin) => origin.trim())

app.disable('x-powered-by')
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', immutable: true }))
app.use('/api', rateLimit({ windowMs: 1 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }))

app.get('/api/health', (_req, res) => res.status(200).json({ success: true, message: 'Muchi Bari API is healthy' }))
app.use('/api/auth', authRouter)
app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/orders', orderRouter)
app.use('/api/reviews', reviewRouter)
app.use('/api/banner', bannerRouter)
app.use('/api/uploads', uploadRouter)

app.use(notFound)
app.use(errorHandler)

const port = Number(process.env.PORT) || 5000
connectDB().then(() => app.listen(port, () => console.log(`Muchi Bari API listening on port ${port}`)))
