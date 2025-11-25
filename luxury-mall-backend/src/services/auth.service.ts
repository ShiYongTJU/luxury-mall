import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {
  getAdminUserByUsername,
  getAdminUserById,
  createAdminUser,
  updateAdminUser,
  updateAdminUserLastLogin,
  getAdminUsers,
  getUserPermissions,
  hasPermission
} from '../database/pg-db'
import {
  AdminUser,
  CreateAdminUserData,
  UpdateAdminUserData,
  AdminLoginData,
  AdminLoginResponse
} from '../types/auth'
import { AppError } from '../middleware/errorHandler'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export class AuthService {
  // 生成JWT Token
  static generateToken(userId: string, username: string): string {
    return jwt.sign(
      { userId, username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )
  }

  // 验证JWT Token
  static verifyToken(token: string): { userId: string; username: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string }
      return decoded
    } catch (error) {
      return null
    }
  }

  // 注册
  static async register(userData: CreateAdminUserData): Promise<AdminUser> {
    // 检查用户名是否已存在
    const existingUser = await getAdminUserByUsername(userData.username)
    if (existingUser) {
      const error: AppError = new Error('用户名已存在')
      error.statusCode = 400
      throw error
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // 生成用户ID
    const userId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 创建用户
    const user = await createAdminUser({
      ...userData,
      id: userId,
      password: hashedPassword
    })

    return user
  }

  // 登录
  static async login(loginData: AdminLoginData): Promise<AdminLoginResponse> {
    // 查找用户（包含密码）
    const userWithPassword = await getAdminUserByUsername(loginData.username, true)
    if (!userWithPassword || !userWithPassword.password) {
      const error: AppError = new Error('用户名或密码错误')
      error.statusCode = 401
      throw error
    }

    // 检查用户状态
    if (userWithPassword.status !== 'active') {
      const error: AppError = new Error('用户已被禁用或锁定')
      error.statusCode = 403
      throw error
    }

    // 验证密码
    const passwordMatch = await bcrypt.compare(loginData.password, userWithPassword.password)
    if (!passwordMatch) {
      const error: AppError = new Error('用户名或密码错误')
      error.statusCode = 401
      throw error
    }

    // 移除密码字段
    const { password, ...user } = userWithPassword

    // 更新最后登录时间
    await updateAdminUserLastLogin(user.id)

    // 获取用户权限
    const permissions = await getUserPermissions(user.id)

    // 生成Token
    const token = this.generateToken(user.id, user.username)

    return {
      user,
      token,
      permissions
    }
  }

  // 获取用户信息
  static async getUserById(userId: string): Promise<AdminUser | null> {
    return await getAdminUserById(userId)
  }

  // 获取所有用户
  static async getUsers(): Promise<AdminUser[]> {
    return await getAdminUsers()
  }

  // 创建用户
  static async createUser(userData: CreateAdminUserData): Promise<AdminUser> {
    // 检查用户名是否已存在
    const existingUser = await getAdminUserByUsername(userData.username)
    if (existingUser) {
      const error: AppError = new Error('用户名已存在')
      error.statusCode = 400
      throw error
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(userData.password, 10)

    // 生成用户ID
    const userId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return await createAdminUser({
      ...userData,
      id: userId,
      password: hashedPassword
    })
  }

  // 更新用户
  static async updateUser(userId: string, updates: UpdateAdminUserData): Promise<AdminUser | null> {
    return await updateAdminUser(userId, updates)
  }

  // 检查权限
  static async checkPermission(userId: string, permissionCode: string): Promise<boolean> {
    return await hasPermission(userId, permissionCode)
  }

  // 获取用户权限列表
  static async getUserPermissionCodes(userId: string): Promise<string[]> {
    return await getUserPermissions(userId)
  }
}

