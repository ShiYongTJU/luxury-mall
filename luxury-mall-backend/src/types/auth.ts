// 后台用户相关类型
export interface AdminUser {
  id: string
  username: string
  email?: string
  phone?: string
  realName?: string
  status: 'active' | 'inactive' | 'locked'
  createTime: string
  updateTime: string
  lastLoginTime?: string
  roles?: Role[]
}

export interface CreateAdminUserData {
  username: string
  password: string
  email?: string
  phone?: string
  realName?: string
  roleIds?: string[]
}

export interface UpdateAdminUserData {
  email?: string
  phone?: string
  realName?: string
  status?: 'active' | 'inactive' | 'locked'
  roleIds?: string[]
}

export interface AdminLoginData {
  username: string
  password: string
}

export interface AdminLoginResponse {
  user: AdminUser
  token: string
  permissions: string[] // 权限代码列表
}

// 角色相关类型
export interface Role {
  id: string
  name: string
  code: string
  description?: string
  isSystem: boolean
  createTime: string
  updateTime: string
  permissions?: Permission[]
}

export interface CreateRoleData {
  name: string
  code: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRoleData {
  name?: string
  description?: string
  permissionIds?: string[]
}

// 权限相关类型
export interface Permission {
  id: string
  code: string
  name: string
  type: 'menu' | 'button'
  parentId?: string
  path?: string
  description?: string
  sortOrder: number
  createTime: string
  updateTime: string
  children?: Permission[]
}

export interface CreatePermissionData {
  code: string
  name: string
  type: 'menu' | 'button'
  parentId?: string
  path?: string
  description?: string
  sortOrder?: number
}

export interface UpdatePermissionData {
  name?: string
  path?: string
  description?: string
  sortOrder?: number
  parentId?: string
}

// Excel导入相关类型
export interface PermissionExcelRow {
  权限代码: string
  权限名称: string
  权限类型: '菜单' | '按钮' | 'menu' | 'button'
  父权限代码?: string
  路径?: string
  描述?: string
  排序?: number
}

export interface RoleExcelRow {
  角色代码: string
  角色名称: string
  描述?: string
  权限代码列表?: string // 逗号分隔的权限代码
}

