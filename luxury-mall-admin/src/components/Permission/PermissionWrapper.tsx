import { ReactNode } from 'react'
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../../api/auth'

interface PermissionWrapperProps {
  permission?: string
  permissions?: string[]
  mode?: 'any' | 'all' // any: 满足任意一个即可, all: 必须全部满足
  fallback?: ReactNode
  children: ReactNode
}

/**
 * 权限控制组件
 * 根据用户权限决定是否显示子组件
 */
export const PermissionWrapper = ({
  permission,
  permissions,
  mode = 'any',
  fallback = null,
  children
}: PermissionWrapperProps) => {
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (mode === 'any') {
      hasAccess = hasAnyPermission(...permissions)
    } else {
      hasAccess = hasAllPermissions(...permissions)
    }
  } else {
    // 如果没有指定权限，默认显示
    hasAccess = true
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>
}

/**
 * 按钮权限控制组件
 */
export const PermissionButton = ({
  permission,
  permissions,
  mode = 'any',
  fallback = null,
  children,
  ...props
}: PermissionWrapperProps & any) => {
  let hasAccess = false

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (permissions) {
    if (mode === 'any') {
      hasAccess = hasAnyPermission(...permissions)
    } else {
      hasAccess = hasAllPermissions(...permissions)
    }
  } else {
    hasAccess = true
  }

  if (!hasAccess) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

