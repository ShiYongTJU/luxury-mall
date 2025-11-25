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

// 用户管理（需要认证和权限）
router.get('/admin/users', authenticate, checkPermission('menu:system:user'), getAdminUsers)
router.post('/admin/users', authenticate, checkPermission('button:user:add'), createAdminUser)
router.put('/admin/users/:id', authenticate, checkPermission('button:user:edit'), updateAdminUser)

// 角色管理
router.get('/admin/roles', authenticate, checkPermission('menu:system:role'), getRoles)
router.get('/admin/roles/:id', authenticate, checkPermission('menu:system:role'), getRole)
router.post('/admin/roles', authenticate, checkPermission('button:role:add'), createRole)
router.put('/admin/roles/:id', authenticate, checkPermission('button:role:edit'), updateRole)
router.delete('/admin/roles/:id', authenticate, checkPermission('button:role:delete'), deleteRole)

// 权限管理
router.get('/admin/permissions', authenticate, checkPermission('menu:system:permission'), getPermissions)
router.get('/admin/permissions/:id', authenticate, checkPermission('menu:system:permission'), getPermission)
router.post('/admin/permissions', authenticate, checkPermission('button:permission:add'), createPermission)
router.put('/admin/permissions/:id', authenticate, checkPermission('button:permission:edit'), updatePermission)
router.delete('/admin/permissions/:id', authenticate, checkPermission('button:permission:delete'), deletePermission)

// Excel导入
router.post('/admin/permissions/import', authenticate, checkPermission('button:permission:import'), uploadPermissionExcel)
router.post('/admin/roles/import', authenticate, checkPermission('button:role:import'), uploadRoleExcel)

export default router

