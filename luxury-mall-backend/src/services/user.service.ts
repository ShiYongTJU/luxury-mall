import { User, RegisterData, LoginData } from '../types/user'
import { Database } from '../database/db'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'luxury-mall-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class UserService {
  // 注册用户
  static async register(data: RegisterData): Promise<Omit<User, 'password'>> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 检查手机号是否已注册
    const existingUser = await Database.getUserByPhone(data.phone)
    if (existingUser) {
      const error: any = new Error('手机号已被注册')
      error.statusCode = 400
      throw error
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 10)
    
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      username: data.username,
      phone: data.phone,
      email: data.email,
      password: hashedPassword,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    }
    
    await Database.addUser(newUser)
    
    // 返回用户信息（不包含密码）
    const { password, ...userWithoutPassword } = newUser
    return userWithoutPassword
  }

  // 登录
  static async login(data: LoginData): Promise<{ user: Omit<User, 'password'>; token: string }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 查找用户
    const user = await Database.getUserByPhone(data.phone)
    if (!user) {
      const error: any = new Error('手机号或密码错误')
      error.statusCode = 401
      throw error
    }
    
    // 验证密码
    const isPasswordValid = await bcrypt.compare(data.password, user.password)
    if (!isPasswordValid) {
      const error: any = new Error('手机号或密码错误')
      error.statusCode = 401
      throw error
    }
    
    // 生成JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    )
    
    // 返回用户信息和token
    const { password, ...userWithoutPassword } = user
    return {
      user: userWithoutPassword,
      token
    }
  }

  // 根据ID获取用户信息
  static async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const user = await Database.getUserById(id)
    if (!user) {
      return null
    }
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 验证token
  static verifyToken(token: string): { userId: string; phone: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  // 生成token（用于注册后自动登录）
  static generateToken(userId: string, phone: string): string {
    return jwt.sign(
      { userId, phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    )
  }
}

