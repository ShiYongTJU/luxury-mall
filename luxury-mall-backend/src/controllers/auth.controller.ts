import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { RoleService } from '../services/role.service'
import { PermissionService } from '../services/permission.service'
import { parsePermissionExcel, parseRoleExcel } from '../utils/excelParser'
import multer from 'multer'
import {
  CreateAdminUserData,
  UpdateAdminUserData,
  AdminLoginData,
  CreateRoleData,
  UpdateRoleData,
  CreatePermissionData,
  UpdatePermissionData
} from '../types/auth'
import { AppError } from '../middleware/errorHandler'

// 配置multer用于文件上传
const upload = multer({ storage: multer.memoryStorage() })

// 后台用户注册
export const adminRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const registerData = req.body as CreateAdminUserData
    
    if (!registerData.username || !registerData.password) {
      const error: AppError = new Error('用户名和密码为必填项')
      error.statusCode = 400
      throw error
    }

    const user = await AuthService.register(registerData)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

// 后台用户登录
export const adminLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loginData = req.body as AdminLoginData
    
    if (!loginData.username || !loginData.password) {
      const error: AppError = new Error('用户名和密码为必填项')
      error.statusCode = 400
      throw error
    }

    const result = await AuthService.login(loginData)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// 获取当前用户信息
export const getCurrentAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }

    const user = await AuthService.getUserById(req.userId)
    if (!user) {
      const error: AppError = new Error('用户不存在')
      error.statusCode = 404
      throw error
    }

    // 获取用户权限
    const permissions = await AuthService.getUserPermissionCodes(req.userId)
    
    res.json({
      ...user,
      permissions
    })
  } catch (error) {
    next(error)
  }
}

// 获取所有后台用户
export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await AuthService.getUsers()
    res.json(users)
  } catch (error) {
    next(error)
  }
}

// 创建后台用户
export const createAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = req.body as CreateAdminUserData
    
    if (!userData.username || !userData.password) {
      const error: AppError = new Error('用户名和密码为必填项')
      error.statusCode = 400
      throw error
    }

    const user = await AuthService.createUser(userData)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

// 更新后台用户
export const updateAdminUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const updates = req.body as UpdateAdminUserData

    const user = await AuthService.updateUser(id, updates)
    if (!user) {
      const error: AppError = new Error('用户不存在')
      error.statusCode = 404
      throw error
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

// 获取所有角色
export const getRoles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roles = await RoleService.getRoles()
    res.json(roles)
  } catch (error) {
    next(error)
  }
}

// 获取角色详情
export const getRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const role = await RoleService.getRoleById(id)
    
    if (!role) {
      const error: AppError = new Error('角色不存在')
      error.statusCode = 404
      throw error
    }

    res.json(role)
  } catch (error) {
    next(error)
  }
}

// 创建角色
export const createRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const roleData = req.body as CreateRoleData
    
    if (!roleData.name || !roleData.code) {
      const error: AppError = new Error('角色名称和代码为必填项')
      error.statusCode = 400
      throw error
    }

    const role = await RoleService.createRole(roleData)
    res.status(201).json(role)
  } catch (error) {
    next(error)
  }
}

// 更新角色
export const updateRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const updates = req.body as UpdateRoleData

    const role = await RoleService.updateRole(id, updates)
    if (!role) {
      const error: AppError = new Error('角色不存在')
      error.statusCode = 404
      throw error
    }

    res.json(role)
  } catch (error) {
    next(error)
  }
}

// 删除角色
export const deleteRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const success = await RoleService.deleteRole(id)
    
    if (!success) {
      const error: AppError = new Error('角色不存在或无法删除')
      error.statusCode = 404
      throw error
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    next(error)
  }
}

// 获取所有权限
export const getPermissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tree = req.query.tree === 'true'
    const permissions = tree
      ? await PermissionService.getPermissions()
      : await PermissionService.getPermissionsFlat()
    res.json(permissions)
  } catch (error) {
    next(error)
  }
}

// 获取权限详情
export const getPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const permission = await PermissionService.getPermissionById(id)
    
    if (!permission) {
      const error: AppError = new Error('权限不存在')
      error.statusCode = 404
      throw error
    }

    res.json(permission)
  } catch (error) {
    next(error)
  }
}

// 创建权限
export const createPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const permissionData = req.body as CreatePermissionData
    
    if (!permissionData.code || !permissionData.name || !permissionData.type) {
      const error: AppError = new Error('权限代码、名称和类型为必填项')
      error.statusCode = 400
      throw error
    }

    const permission = await PermissionService.createPermission(permissionData)
    res.status(201).json(permission)
  } catch (error) {
    next(error)
  }
}

// 更新权限
export const updatePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const updates = req.body as UpdatePermissionData

    const permission = await PermissionService.updatePermission(id, updates)
    if (!permission) {
      const error: AppError = new Error('权限不存在')
      error.statusCode = 404
      throw error
    }

    res.json(permission)
  } catch (error) {
    next(error)
  }
}

// 删除权限
export const deletePermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const success = await PermissionService.deletePermission(id)
    
    if (!success) {
      const error: AppError = new Error('权限不存在')
      error.statusCode = 404
      throw error
    }

    res.json({ message: '删除成功' })
  } catch (error) {
    next(error)
  }
}

// 上传权限Excel文件
export const uploadPermissionExcel = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        const error: AppError = new Error('请上传文件')
        error.statusCode = 400
        throw error
      }

      const result = await parsePermissionExcel(req.file.buffer)
      res.json({
        message: '导入完成',
        ...result
      })
    } catch (error) {
      next(error)
    }
  }
]

// 上传角色Excel文件
export const uploadRoleExcel = [
  upload.single('file'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        const error: AppError = new Error('请上传文件')
        error.statusCode = 400
        throw error
      }

      const result = await parseRoleExcel(req.file.buffer)
      res.json({
        message: '导入完成',
        ...result
      })
    } catch (error) {
      next(error)
    }
  }
]

