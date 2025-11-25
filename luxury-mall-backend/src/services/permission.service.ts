import {
  getPermissions,
  getPermissionById,
  getPermissionByCode,
  createPermission,
  updatePermission,
  deletePermission
} from '../database/pg-db'
import { Permission, CreatePermissionData, UpdatePermissionData } from '../types/auth'
import { AppError } from '../middleware/errorHandler'

export class PermissionService {
  // 获取所有权限（树形结构）
  static async getPermissions(): Promise<Permission[]> {
    const allPermissions = await getPermissions()
    
    // 构建树形结构
    const permissionMap = new Map<string, Permission>()
    const rootPermissions: Permission[] = []

    // 先创建所有权限的映射
    allPermissions.forEach(perm => {
      permissionMap.set(perm.id, { ...perm, children: [] })
    })

    // 构建树形结构
    allPermissions.forEach(perm => {
      const permission = permissionMap.get(perm.id)!
      if (perm.parentId && permissionMap.has(perm.parentId)) {
        const parent = permissionMap.get(perm.parentId)!
        if (!parent.children) {
          parent.children = []
        }
        parent.children.push(permission)
      } else {
        rootPermissions.push(permission)
      }
    })

    return rootPermissions
  }

  // 获取所有权限（扁平结构）
  static async getPermissionsFlat(): Promise<Permission[]> {
    return await getPermissions()
  }

  // 根据ID获取权限
  static async getPermissionById(id: string): Promise<Permission | null> {
    return await getPermissionById(id)
  }

  // 根据代码获取权限
  static async getPermissionByCode(code: string): Promise<Permission | null> {
    return await getPermissionByCode(code)
  }

  // 创建权限
  static async createPermission(permissionData: CreatePermissionData): Promise<Permission> {
    // 检查权限代码是否已存在
    const existingPermission = await getPermissionByCode(permissionData.code)
    if (existingPermission) {
      const error: AppError = new Error('权限代码已存在')
      error.statusCode = 400
      throw error
    }

    // 如果指定了父权限，验证父权限是否存在
    if (permissionData.parentId) {
      const parent = await getPermissionById(permissionData.parentId)
      if (!parent) {
        const error: AppError = new Error('父权限不存在')
        error.statusCode = 400
        throw error
      }
    }

    // 生成权限ID
    const permissionId = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return await createPermission({
      ...permissionData,
      id: permissionId
    })
  }

  // 更新权限
  static async updatePermission(id: string, updates: UpdatePermissionData): Promise<Permission | null> {
    const permission = await getPermissionById(id)
    if (!permission) {
      const error: AppError = new Error('权限不存在')
      error.statusCode = 404
      throw error
    }

    // 如果更新父权限，验证父权限是否存在且不是自己
    if (updates.parentId !== undefined) {
      if (updates.parentId === id) {
        const error: AppError = new Error('不能将自己设为父权限')
        error.statusCode = 400
        throw error
      }
      if (updates.parentId) {
        const parent = await getPermissionById(updates.parentId)
        if (!parent) {
          const error: AppError = new Error('父权限不存在')
          error.statusCode = 400
          throw error
        }
      }
    }

    return await updatePermission(id, updates)
  }

  // 删除权限
  static async deletePermission(id: string): Promise<boolean> {
    const permission = await getPermissionById(id)
    if (!permission) {
      const error: AppError = new Error('权限不存在')
      error.statusCode = 404
      throw error
    }

    return await deletePermission(id)
  }
}

