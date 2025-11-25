import { Router } from 'express'
import {
  adminRegister,
  adminLogin,
  getCurrentAdminUser,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  uploadPermissionExcel,
  uploadRoleExcel
} from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { checkPermission } from '../middleware/permission'

const router = Router()

// 公开路由（不需要认证）
router.post('/admin/register', adminRegister)
router.post('/admin/login', adminLogin)

// 需要认证的路由
router.get('/admin/me', authenticate, getCurrentAdminUser)

// 用户管理（需要认证，系统管理员可访问所有）
router.get('/admin/users', authenticate, getAdminUsers)
router.post('/admin/users', authenticate, createAdminUser)
router.put('/admin/users/:id', authenticate, updateAdminUser)

// 角色管理
router.get('/admin/roles', authenticate, getRoles)
router.get('/admin/roles/:id', authenticate, getRole)
router.post('/admin/roles', authenticate, createRole)
router.put('/admin/roles/:id', authenticate, updateRole)
router.delete('/admin/roles/:id', authenticate, deleteRole)

// 权限管理
router.get('/admin/permissions', authenticate, getPermissions)
router.get('/admin/permissions/:id', authenticate, getPermission)
router.post('/admin/permissions', authenticate, createPermission)
router.put('/admin/permissions/:id', authenticate, updatePermission)
router.delete('/admin/permissions/:id', authenticate, deletePermission)

// Excel导入
router.post('/admin/permissions/import', authenticate, uploadPermissionExcel)
router.post('/admin/roles/import', authenticate, uploadRoleExcel)

export default router

