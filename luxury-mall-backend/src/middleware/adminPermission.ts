import { Request, Response, NextFunction } from 'express'
import { hasPermission, getAdminUserById } from '../database/pg-db'
import { AppError } from './errorHandler'
import { AuthService } from '../services/auth.service'

/**
 * 管理后台认证中间件
 * 验证管理后台用户的token
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // 如果没有token，允许通过（可能是前端用户）
      return next()
    }

    const token = authHeader.substring(7) // 移除 "Bearer " 前缀
    
    // 验证token
    const decoded = AuthService.verifyToken(token)
    if (!decoded) {
      // token无效，允许通过（可能是前端用户）
      return next()
    }

    // 检查是否是管理后台用户
    const adminUser = await getAdminUserById(decoded.userId)
    if (!adminUser) {
      // 不是管理后台用户，允许通过（可能是前端用户）
      return next()
    }

    // 将userId添加到请求对象
    req.userId = decoded.userId
    next()
  } catch (error) {
    // 出错时允许通过（可能是前端用户）
    next()
  }
}

/**
 * 管理后台权限检查中间件
 * 用于保护管理后台的API，确保只有有权限的管理员才能访问
 * 
 * 使用方式：
 * - GET请求：需要菜单权限（如 menu:product:list）
 * - POST/PUT/DELETE请求：需要按钮权限（如 button:product:add）
 */
export function checkAdminPermission(
  menuPermission: string, // 菜单权限（用于GET请求）
  buttonPermission?: string // 按钮权限（用于POST/PUT/DELETE请求，可选）
) {
  return [
    authenticateAdmin, // 先进行认证
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 只有管理后台用户才需要权限检查
        if (!req.userId) {
          // 如果不是管理后台用户，允许通过（可能是前端用户）
          return next()
        }

        // 根据请求方法选择需要的权限
        const requiredPermission = 
          (req.method === 'GET' || req.method === 'OPTIONS') 
            ? menuPermission 
            : (buttonPermission || menuPermission)

        // 检查权限
        const hasAccess = await hasPermission(req.userId, requiredPermission)
        if (!hasAccess) {
          const error: AppError = new Error(`没有权限执行此操作，需要权限: ${requiredPermission}`)
          error.statusCode = 403
          throw error
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  ]
}

/**
 * 管理后台权限检查中间件（根据数据源类型动态检查）
 * 用于数据源API，根据type参数动态检查权限
 */
export function checkDataSourcePermission() {
  return [
    authenticateAdmin,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 只有管理后台用户才需要权限检查
        if (!req.userId) {
          return next()
        }

        const type = req.params.type
        if (!type) {
          return next()
        }

        // 根据数据源类型映射到对应的权限
        const permissionMap: Record<string, { menu: string; add?: string; edit?: string; delete?: string }> = {
          carousel: { 
            menu: 'menu:operation:carousel', 
            add: 'button:carousel:add',
            edit: 'button:carousel:edit',
            delete: 'button:carousel:delete'
          },
          seckill: { 
            menu: 'menu:operation:seckill', 
            add: 'button:seckill:add',
            edit: 'button:seckill:edit',
            delete: 'button:seckill:delete'
          },
          groupbuy: { 
            menu: 'menu:operation:groupbuy', 
            add: 'button:groupbuy:add',
            edit: 'button:groupbuy:edit',
            delete: 'button:groupbuy:delete'
          },
          productList: { 
            menu: 'menu:operation:productList', 
            add: 'button:productList:add',
            edit: 'button:productList:edit',
            delete: 'button:productList:delete'
          },
          guessYouLike: { 
            menu: 'menu:operation:guessYouLike', 
            add: 'button:guessYouLike:add',
            edit: 'button:guessYouLike:edit',
            delete: 'button:guessYouLike:delete'
          }
        }

        const permissions = permissionMap[type]
        if (!permissions) {
          return next() // 未知类型，允许通过
        }

        // 根据请求方法选择需要的权限
        let requiredPermission = permissions.menu
        if (req.method === 'GET' || req.method === 'OPTIONS') {
          requiredPermission = permissions.menu
        } else if (req.method === 'POST') {
          requiredPermission = permissions.add || permissions.menu
        } else if (req.method === 'PUT' || req.method === 'PATCH') {
          requiredPermission = permissions.edit || permissions.menu
        } else if (req.method === 'DELETE') {
          requiredPermission = permissions.delete || permissions.menu
        }

        // 检查权限
        const hasAccess = await hasPermission(req.userId, requiredPermission)
        if (!hasAccess) {
          const error: AppError = new Error(`没有权限执行此操作，需要权限: ${requiredPermission}`)
          error.statusCode = 403
          throw error
        }

        next()
      } catch (error) {
        next(error)
      }
    }
  ]
}

