import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { AppError } from './errorHandler'

// 扩展Request类型以包含userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: AppError = new Error('未提供认证token')
      error.statusCode = 401
      throw error
    }

    const token = authHeader.substring(7) // 移除 "Bearer " 前缀
    
    // 验证token
    const decoded = UserService.verifyToken(token)
    if (!decoded) {
      const error: AppError = new Error('无效的token')
      error.statusCode = 401
      throw error
    }

    // 将userId添加到请求对象
    req.userId = decoded.userId
    next()
  } catch (error) {
    next(error)
  }
}


