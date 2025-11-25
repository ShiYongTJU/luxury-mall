import {
  getRoles,
  getRoleById,
  getRoleByCode,
  createRole,
  updateRole,
  deleteRole
} from '../database/pg-db'
import { Role, CreateRoleData, UpdateRoleData } from '../types/auth'
import { AppError } from '../middleware/errorHandler'

export class RoleService {
  // 获取所有角色
  static async getRoles(): Promise<Role[]> {
    return await getRoles()
  }

  // 根据ID获取角色
  static async getRoleById(id: string): Promise<Role | null> {
    return await getRoleById(id)
  }

  // 根据代码获取角色
  static async getRoleByCode(code: string): Promise<Role | null> {
    return await getRoleByCode(code)
  }

  // 创建角色
  static async createRole(roleData: CreateRoleData): Promise<Role> {
    // 检查角色代码是否已存在
    const existingRole = await getRoleByCode(roleData.code)
    if (existingRole) {
      const error: AppError = new Error('角色代码已存在')
      error.statusCode = 400
      throw error
    }

    // 生成角色ID
    const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return await createRole({
      ...roleData,
      id: roleId
    })
  }

  // 更新角色
  static async updateRole(id: string, updates: UpdateRoleData): Promise<Role | null> {
    const role = await getRoleById(id)
    if (!role) {
      const error: AppError = new Error('角色不存在')
      error.statusCode = 404
      throw error
    }

    if (role.isSystem) {
      const error: AppError = new Error('系统角色不可修改')
      error.statusCode = 403
      throw error
    }

    return await updateRole(id, updates)
  }

  // 删除角色
  static async deleteRole(id: string): Promise<boolean> {
    const role = await getRoleById(id)
    if (!role) {
      const error: AppError = new Error('角色不存在')
      error.statusCode = 404
      throw error
    }

    if (role.isSystem) {
      const error: AppError = new Error('系统角色不可删除')
      error.statusCode = 403
      throw error
    }

    return await deleteRole(id)
  }
}

