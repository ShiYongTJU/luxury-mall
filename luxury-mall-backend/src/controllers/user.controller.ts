import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { AppError } from '../middleware/errorHandler'
import { RegisterData, LoginData } from '../types/user'

// 注册
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registerData = req.body as RegisterData
    
    // 验证必填字段
    if (!registerData.username || !registerData.phone || !registerData.password) {
      const error: AppError = new Error('用户名、手机号和密码为必填项')
      error.statusCode = 400
      throw error
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(registerData.phone)) {
      const error: AppError = new Error('手机号格式不正确')
      error.statusCode = 400
      throw error
    }

    // 验证密码长度
    if (registerData.password.length < 6) {
      const error: AppError = new Error('密码长度至少6位')
      error.statusCode = 400
      throw error
    }

    const user = await UserService.register(registerData)
    
    // 注册后自动登录，生成token
    const token = UserService.generateToken(user.id, user.phone)
    
    res.status(201).json({
      user,
      token
    })
  } catch (error) {
    next(error)
  }
}

// 登录
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginData = req.body as LoginData
    
    if (!loginData.phone || !loginData.password) {
      const error: AppError = new Error('手机号和密码为必填项')
      error.statusCode = 400
      throw error
    }

    const result = await UserService.login(loginData)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// 获取当前用户信息
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }

    const user = await UserService.getUserById(req.userId)
    
    if (!user) {
      const error: AppError = new Error('用户不存在')
      error.statusCode = 404
      throw error
    }
    
    res.json(user)
  } catch (error) {
    next(error)
  }
}

