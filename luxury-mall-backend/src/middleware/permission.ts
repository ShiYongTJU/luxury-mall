import { Request, Response, NextFunction } from 'express'
import { hasPermission } from '../database/pg-db'
import { AppError } from './errorHandler'

// 权限检查中间件工厂函数
export function checkPermission(permissionCode: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        const error: AppError = new Error('未认证')
        error.statusCode = 401
        throw error
      }

      // 检查权限
      const hasAccess = await hasPermission(req.userId, permissionCode)
      if (!hasAccess) {
        const error: AppError = new Error('没有权限访问此资源')
        error.statusCode = 403
        throw error
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// 检查多个权限（满足任意一个即可）
export function checkAnyPermission(...permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        const error: AppError = new Error('未认证')
        error.statusCode = 401
        throw error
      }

      // 检查是否有任意一个权限
      let hasAccess = false
      for (const code of permissionCodes) {
        if (await hasPermission(req.userId, code)) {
          hasAccess = true
          break
        }
      }

      if (!hasAccess) {
        const error: AppError = new Error('没有权限访问此资源')
        error.statusCode = 403
        throw error
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// 检查所有权限（必须全部满足）
export function checkAllPermissions(...permissionCodes: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        const error: AppError = new Error('未认证')
        error.statusCode = 401
        throw error
      }

      // 检查是否所有权限都满足
      for (const code of permissionCodes) {
        const hasAccess = await hasPermission(req.userId, code)
        if (!hasAccess) {
          const error: AppError = new Error(`缺少权限: ${code}`)
          error.statusCode = 403
          throw error
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

