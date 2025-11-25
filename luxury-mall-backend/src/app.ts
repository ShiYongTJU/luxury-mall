import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import productRoutes from './routes/product.routes'
import imageRoutes from './routes/image.routes'
import pageRoutes from './routes/page.routes'
import datasourceRoutes from './routes/datasource.routes'
import searchRoutes from './routes/search.routes'
import orderRoutes from './routes/order.routes'
import addressRoutes from './routes/address.routes'
import regionRoutes from './routes/region.routes'
import userRoutes from './routes/user.routes'
import homepageRoutes from './routes/homepage.routes'
import authRoutes from './routes/auth.routes'
import { updateProduct, addProduct } from './controllers/product.controller'
import { updateImage, addImage } from './controllers/image.controller'
import { uploadImage, getUploadedImages, deleteUploadedImage } from './controllers/upload.controller'
import { errorHandler } from './middleware/errorHandler'
import { initDatabase } from './database/pg-db'

dotenv.config()

// 如果使用数据库，初始化连接
if (process.env.USE_DATABASE === 'true') {
  initDatabase()
  console.log('✓ 使用 PostgreSQL 数据库')
} else {
  console.log('✓ 使用 JSON 文件存储')
}

const app = express()
const PORT = process.env.PORT || 3001

// 禁用 Express 的 ETag（防止 304 响应）
app.set('etag', false)

// CORS 配置
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:3000', 
      'http://localhost:5173', 
      'http://localhost:3002',  // Admin 开发环境
      'http://127.0.0.1:3000', 
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3002',  // Admin 开发环境
      'http://1.15.93.186:3002'  // Admin 生产环境
    ]

// 中间件
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(cors({
  origin: (origin, callback) => {
    // 允许没有origin的请求（如Postman、移动应用等）
    if (!origin) {
      return callback(null, true)
    }
    
    // 检查origin是否在允许列表中
    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      // 开发环境允许所有来源
      if (process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        // 生产环境：检查是否是服务器 IP 的请求（允许同服务器的不同端口）
        const serverHost = process.env.SERVER_HOST || '1.15.93.186'
        const originHost = new URL(origin).hostname
        if (originHost === serverHost || originHost === 'localhost' || originHost === '127.0.0.1') {
          callback(null, true)
        } else {
          console.warn(`CORS blocked origin: ${origin}`)
          callback(new Error('Not allowed by CORS'))
        }
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 禁用缓存中间件 - 确保所有 API 返回 200 而不是 304
app.use((req, res, next) => {
  // 禁用 ETag
  res.set('ETag', '')
  // 设置无缓存响应头
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  next()
})

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API 路由
app.use('/api/products', productRoutes)
// 商品更新接口（统一路径）
app.put('/api/updateProducts', updateProduct)
app.post('/api/updateProducts', updateProduct)
// 商品新增接口（统一路径）
app.post('/api/addProducts', addProduct)
app.use('/api/images', imageRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/datasource', datasourceRoutes)
// 图片更新接口（统一路径）
app.put('/api/updateImages', updateImage)
app.post('/api/updateImages', updateImage)
// 图片新增接口（统一路径）
app.post('/api/addImages', addImage)
// 图片上传接口
app.post('/api/upload/image', uploadImage)
// 获取已上传的图片文件列表
app.get('/api/upload/images', getUploadedImages)
// 删除已上传的图片文件
app.delete('/api/upload/images/:filename', deleteUploadedImage)
// 静态文件服务（用于访问上传的图片）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use('/api/search', searchRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/regions', regionRoutes)
app.use('/api/homepage', homepageRoutes)
app.use('/api', authRoutes)

// 404 处理
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  })
})

// 错误处理中间件（必须放在最后）
app.use(errorHandler)

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS enabled for: ${allowedOrigins.join(', ')}`)
  if (process.env.NODE_ENV === 'development') {
    console.log(`⚠️  Development mode: All origins allowed`)
  }
})



