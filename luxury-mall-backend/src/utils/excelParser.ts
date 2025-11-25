import * as XLSX from 'xlsx'
import {
  PermissionExcelRow,
  RoleExcelRow
} from '../types/auth'
import {
  createPermission,
  getPermissionByCode,
  createRole,
  getRoleByCode
} from '../database/pg-db'
import { AppError } from '../middleware/errorHandler'

// 解析权限Excel文件
export async function parsePermissionExcel(fileBuffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data: PermissionExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

  let success = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel行号（从2开始，因为第1行是标题）

    try {
      // 验证必填字段
      if (!row.权限代码 || !row.权限名称 || !row.权限类型) {
        errors.push(`第${rowNum}行：权限代码、权限名称、权限类型为必填项`)
        failed++
        continue
      }

      // 转换权限类型
      let permissionType: 'menu' | 'button'
      if (row.权限类型 === '菜单' || row.权限类型 === 'menu') {
        permissionType = 'menu'
      } else if (row.权限类型 === '按钮' || row.权限类型 === 'button') {
        permissionType = 'button'
      } else {
        errors.push(`第${rowNum}行：权限类型必须是"菜单"或"按钮"`)
        failed++
        continue
      }

      // 检查权限代码是否已存在
      const existing = await getPermissionByCode(row.权限代码)
      if (existing) {
        errors.push(`第${rowNum}行：权限代码"${row.权限代码}"已存在，跳过`)
        failed++
        continue
      }

      // 处理父权限
      let parentId: string | undefined
      if (row.父权限代码) {
        const parent = await getPermissionByCode(row.父权限代码)
        if (!parent) {
          errors.push(`第${rowNum}行：父权限代码"${row.父权限代码}"不存在`)
          failed++
          continue
        }
        parentId = parent.id
      }

      // 创建权限
      const permissionId = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await createPermission({
        id: permissionId,
        code: row.权限代码,
        name: row.权限名称,
        type: permissionType,
        parentId,
        path: row.路径 || undefined,
        description: row.描述 || undefined,
        sortOrder: row.排序 || 0
      })

      success++
    } catch (error: any) {
      errors.push(`第${rowNum}行：${error.message || '未知错误'}`)
      failed++
    }
  }

  return { success, failed, errors }
}

// 解析角色Excel文件
export async function parseRoleExcel(fileBuffer: Buffer): Promise<{ success: number; failed: number; errors: string[] }> {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data: RoleExcelRow[] = XLSX.utils.sheet_to_json(worksheet)

  let success = 0
  let failed = 0
  const errors: string[] = []

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const rowNum = i + 2 // Excel行号

    try {
      // 验证必填字段
      if (!row.角色代码 || !row.角色名称) {
        errors.push(`第${rowNum}行：角色代码、角色名称为必填项`)
        failed++
        continue
      }

      // 检查角色代码是否已存在
      const existing = await getRoleByCode(row.角色代码)
      if (existing) {
        errors.push(`第${rowNum}行：角色代码"${row.角色代码}"已存在，跳过`)
        failed++
        continue
      }

      // 解析权限代码列表
      const permissionIds: string[] = []
      if (row.权限代码列表) {
        const permissionCodes = row.权限代码列表.split(',').map((code: string) => code.trim()).filter(Boolean)
        for (const code of permissionCodes) {
          const permission = await getPermissionByCode(code)
          if (permission) {
            permissionIds.push(permission.id)
          } else {
            errors.push(`第${rowNum}行：权限代码"${code}"不存在`)
          }
        }
      }

      // 创建角色
      const roleId = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await createRole({
        id: roleId,
        name: row.角色名称,
        code: row.角色代码,
        description: row.描述 || undefined,
        permissionIds
      })

      success++
    } catch (error: any) {
      errors.push(`第${rowNum}行：${error.message || '未知错误'}`)
      failed++
    }
  }

  return { success, failed, errors }
}

