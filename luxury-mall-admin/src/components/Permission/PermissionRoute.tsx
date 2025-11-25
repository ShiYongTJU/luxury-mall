import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'
import { hasPermission, getCurrentPermissions } from '../../api/auth'

interface PermissionRouteProps {
  permission: string | string[]
  children: ReactNode
  fallbackPath?: string
}

/**
 * 路由权限保护组件
 * 检查用户是否有访问该路由的权限
 */
export const PermissionRoute = ({ 
  permission, 
  children, 
  fallbackPath 
}: PermissionRouteProps) => {
  // 检查权限
  let hasAccess = false
  const permissions = getCurrentPermissions()
  const isAdmin = permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))
  
  if (isAdmin) {
    hasAccess = true
  } else if (Array.isArray(permission)) {
    hasAccess = permission.some(p => hasPermission(p))
  } else {
    hasAccess = hasPermission(permission)
  }

  // 如果没有权限，显示无权限页面或重定向
  if (!hasAccess) {
    if (fallbackPath) {
      return <Navigate to={fallbackPath} replace />
    }
    
    // 尝试重定向到用户有权限的第一个页面
    const allMenuPermissions = [
      'menu:operation:page',
      'menu:product:list',
      'menu:product:image:list',
      'menu:product:image:gallery',
      'menu:operation:carousel',
      'menu:operation:seckill',
      'menu:operation:groupbuy',
      'menu:operation:productList',
      'menu:operation:guessYouLike',
      'menu:system:permission',
      'menu:system:role',
      'menu:system:user'
    ]
    
    const firstAvailablePermission = allMenuPermissions.find(p => hasPermission(p))
    if (firstAvailablePermission) {
      const routeMap: Record<string, string> = {
        'menu:operation:page': '/admin/operation/page',
        'menu:product:list': '/admin/product/list',
        'menu:product:image:list': '/admin/operation/image/list',
        'menu:product:image:gallery': '/admin/operation/image/gallery',
        'menu:operation:carousel': '/admin/operation/carousel',
        'menu:operation:seckill': '/admin/operation/seckill',
        'menu:operation:groupbuy': '/admin/operation/groupbuy',
        'menu:operation:productList': '/admin/operation/productList',
        'menu:operation:guessYouLike': '/admin/operation/guessYouLike',
        'menu:system:permission': '/admin/system/permission',
        'menu:system:role': '/admin/system/role',
        'menu:system:user': '/admin/system/user'
      }
      
      return <Navigate to={routeMap[firstAvailablePermission] || '/admin/operation/page'} replace />
    }
    
    return (
      <Result
        status="403"
        title="403"
        subTitle="抱歉，您没有权限访问此页面。"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回上一页
          </Button>
        }
      />
    )
  }

  return <>{children}</>
}

