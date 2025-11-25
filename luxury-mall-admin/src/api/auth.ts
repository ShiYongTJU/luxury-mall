import axios from 'axios'
import { API_ROUTES } from './index'

const API_BASE_URL = '/api'

// 后台用户类型
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
  permissions?: string[]
}

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

export interface AdminLoginData {
  username: string
  password: string
}

export interface AdminLoginResponse {
  user: AdminUser
  token: string
  permissions: string[]
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

// 后台用户注册
export const adminRegister = async (data: CreateAdminUserData): Promise<AdminUser> => {
  const response = await axios.post(`${API_BASE_URL}/admin/register`, data)
  return response.data
}

// 后台用户登录
export const adminLogin = async (data: AdminLoginData): Promise<AdminLoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/admin/login`, data)
  // 保存token到localStorage
  if (response.data.token) {
    localStorage.setItem('admin_token', response.data.token)
    localStorage.setItem('admin_user', JSON.stringify(response.data.user))
    localStorage.setItem('admin_permissions', JSON.stringify(response.data.permissions))
  }
  return response.data
}

// 获取当前用户信息
export const getCurrentAdminUser = async (): Promise<AdminUser> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  // 更新本地存储
  if (response.data.permissions) {
    localStorage.setItem('admin_permissions', JSON.stringify(response.data.permissions))
  }
  return response.data
}

// 获取所有后台用户
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 创建后台用户
export const createAdminUser = async (data: CreateAdminUserData): Promise<AdminUser> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.post(`${API_BASE_URL}/admin/users`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 更新后台用户
export const updateAdminUser = async (id: string, data: UpdateAdminUserData): Promise<AdminUser> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.put(`${API_BASE_URL}/admin/users/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 获取所有角色
export const getRoles = async (): Promise<Role[]> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/roles`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 获取角色详情
export const getRole = async (id: string): Promise<Role> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/roles/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 创建角色
export const createRole = async (data: CreateRoleData): Promise<Role> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.post(`${API_BASE_URL}/admin/roles`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 更新角色
export const updateRole = async (id: string, data: UpdateRoleData): Promise<Role> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.put(`${API_BASE_URL}/admin/roles/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 删除角色
export const deleteRole = async (id: string): Promise<void> => {
  const token = localStorage.getItem('admin_token')
  await axios.delete(`${API_BASE_URL}/admin/roles/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

// 获取所有权限
export const getPermissions = async (tree: boolean = false): Promise<Permission[]> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/permissions`, {
    params: { tree },
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 获取权限详情
export const getPermission = async (id: string): Promise<Permission> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.get(`${API_BASE_URL}/admin/permissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 创建权限
export const createPermission = async (data: CreatePermissionData): Promise<Permission> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.post(`${API_BASE_URL}/admin/permissions`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 更新权限
export const updatePermission = async (id: string, data: UpdatePermissionData): Promise<Permission> => {
  const token = localStorage.getItem('admin_token')
  const response = await axios.put(`${API_BASE_URL}/admin/permissions/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// 删除权限
export const deletePermission = async (id: string): Promise<void> => {
  const token = localStorage.getItem('admin_token')
  await axios.delete(`${API_BASE_URL}/admin/permissions/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
}

// 上传权限Excel文件
export const uploadPermissionExcel = async (file: File): Promise<{ success: number; failed: number; errors: string[] }> => {
  const token = localStorage.getItem('admin_token')
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE_URL}/admin/permissions/import`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// 上传角色Excel文件
export const uploadRoleExcel = async (file: File): Promise<{ success: number; failed: number; errors: string[] }> => {
  const token = localStorage.getItem('admin_token')
  const formData = new FormData()
  formData.append('file', file)
  const response = await axios.post(`${API_BASE_URL}/admin/roles/import`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
}

// 退出登录
export const adminLogout = (): void => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  localStorage.removeItem('admin_permissions')
}

// 获取当前用户权限列表
export const getCurrentPermissions = (): string[] => {
  const permissionsStr = localStorage.getItem('admin_permissions')
  return permissionsStr ? JSON.parse(permissionsStr) : []
}

// 检查是否有权限
export const hasPermission = (permissionCode: string): boolean => {
  const permissions = getCurrentPermissions()
  // 系统管理员拥有所有权限
  if (permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))) {
    return true
  }
  return permissions.includes(permissionCode)
}

// 检查是否有任意一个权限
export const hasAnyPermission = (...permissionCodes: string[]): boolean => {
  const permissions = getCurrentPermissions()
  if (permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))) {
    return true
  }
  return permissionCodes.some(code => permissions.includes(code))
}

// 检查是否有所有权限
export const hasAllPermissions = (...permissionCodes: string[]): boolean => {
  const permissions = getCurrentPermissions()
  if (permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))) {
    return true
  }
  return permissionCodes.every(code => permissions.includes(code))
}

