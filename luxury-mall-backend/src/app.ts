import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import productRoutes from './routes/product.routes'
import searchRoutes from './routes/search.routes'
import orderRoutes from './routes/order.routes'
import addressRoutes from './routes/address.routes'
import regionRoutes from './routes/region.routes'
import userRoutes from './routes/user.routes'
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

// CORS 配置
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173']

// 中间件
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
      // 开发环境允许所有来源（可选，生产环境应移除）
      if (process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
app.use('/api/search', searchRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/regions', regionRoutes)

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



