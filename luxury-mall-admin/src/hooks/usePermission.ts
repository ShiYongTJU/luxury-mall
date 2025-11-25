import { useMemo } from 'react'
import { hasPermission, hasAnyPermission, hasAllPermissions, getCurrentPermissions } from '../api/auth'

/**
 * 权限检查Hook
 */
export const usePermission = () => {
  const permissions = useMemo(() => getCurrentPermissions(), [])

  return {
    permissions,
    hasPermission: (code: string) => hasPermission(code),
    hasAnyPermission: (...codes: string[]) => hasAnyPermission(...codes),
    hasAllPermissions: (...codes: string[]) => hasAllPermissions(...codes),
    isAdmin: () => permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))
  }
}

