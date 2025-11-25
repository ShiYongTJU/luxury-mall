import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button } from 'antd'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { PermissionRoute } from '../Permission/PermissionRoute'
import {
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons'
import ProductList from '../../pages/Product/ProductList'
import PageManagement from '../../pages/Operation/PageManagement'
import PageDesigner from '../../pages/Operation/PageDesigner'
import ImageList from '../../pages/Operation/ImageList'
import ImageGallery from '../../pages/Operation/ImageGallery'
import CarouselManagement from '../../pages/Operation/CarouselManagement'
import SeckillManagement from '../../pages/Operation/SeckillManagement'
import GroupbuyManagement from '../../pages/Operation/GroupbuyManagement'
import ProductListManagement from '../../pages/Operation/ProductListManagement'
import GuessYouLikeManagement from '../../pages/Operation/GuessYouLikeManagement'
import PermissionManagement from '../../pages/System/PermissionManagement'
import RoleManagement from '../../pages/System/RoleManagement'
import UserManagement from '../../pages/System/UserManagement'
import { hasPermission, adminLogout, getCurrentPermissions, AdminUser } from '../../api/auth'
import './AppLayout.css'

const { Header, Sider, Content } = Layout

// 一级菜单配置（顶部横向）
const getTopMenuItems = () => {
  const permissions = getCurrentPermissions()
  const isAdmin = permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))
  const items: any[] = []

  // 检查运营中心权限：是否有任意一个运营相关的菜单权限
  const hasOperationPermission = isAdmin || 
    hasPermission('menu:operation:page') ||
    hasPermission('menu:operation:carousel') ||
    hasPermission('menu:operation:seckill') ||
    hasPermission('menu:operation:groupbuy') ||
    hasPermission('menu:operation:productList') ||
    hasPermission('menu:operation:guessYouLike')
  
  if (hasOperationPermission) {
    items.push({
      key: 'operation',
      icon: <BarChartOutlined />,
      label: '运营中心'
    })
  }

  // 检查商品中心权限：是否有任意一个商品相关的菜单权限
  const hasProductPermission = isAdmin ||
    hasPermission('menu:product:list') ||
    hasPermission('menu:product:image:list') ||
    hasPermission('menu:product:image:gallery')
  
  if (hasProductPermission) {
    items.push({
      key: 'product',
      icon: <ShoppingOutlined />,
      label: '商品中心'
    })
  }

  // 检查系统管理权限：是否有任意一个系统管理相关的菜单权限
  const hasSystemPermission = isAdmin ||
    hasPermission('menu:system:permission') ||
    hasPermission('menu:system:role') ||
    hasPermission('menu:system:user')
  
  if (hasSystemPermission) {
    items.push({
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理'
    })
  }

  return items
}

// 二级和三级菜单配置（左侧纵向）
const getSideMenuItems = (): Record<string, any[]> => {
  const permissions = getCurrentPermissions()
  const isAdmin = permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))

  // 商品中心菜单
  const productMenu: any[] = []
  
  // 商品管理子菜单
  const productManagementChildren: any[] = []
  if (hasPermission('menu:product:list') || isAdmin) {
    productManagementChildren.push({
      key: '/admin/product/list',
      label: '商品列表'
    })
  }
  // 只有当有子菜单时才添加二级菜单
  if (productManagementChildren.length > 0) {
    productMenu.push({
      key: 'product-management',
      label: '商品管理',
      children: productManagementChildren
    })
  }

  // 素材管理子菜单
  const materialManagementChildren: any[] = []
  if (hasPermission('menu:product:image:list') || isAdmin) {
    materialManagementChildren.push({
      key: '/admin/operation/image/list',
      label: '图片列表'
    })
  }
  if (hasPermission('menu:product:image:gallery') || isAdmin) {
    materialManagementChildren.push({
      key: '/admin/operation/image/gallery',
      label: '静态资源'
    })
  }
  // 只有当有子菜单时才添加二级菜单
  if (materialManagementChildren.length > 0) {
    productMenu.push({
      key: 'material-management',
      label: '素材管理',
      children: materialManagementChildren
    })
  }

  // 运营中心菜单
  const operationMenu: any[] = []
  
  // 运营管理子菜单
  const operationManagementChildren: any[] = []
  if (hasPermission('menu:operation:page') || isAdmin) {
    operationManagementChildren.push({
      key: '/admin/operation/page',
      label: '页面管理'
    })
  }
  // 只有当有子菜单时才添加二级菜单
  if (operationManagementChildren.length > 0) {
    operationMenu.push({
      key: 'operation-management',
      label: '运营管理',
      children: operationManagementChildren
    })
  }

  // 数据源管理子菜单
  const dataSourceManagementChildren: any[] = []
  if (hasPermission('menu:operation:carousel') || isAdmin) {
    dataSourceManagementChildren.push({
      key: '/admin/operation/carousel',
      label: '轮播图'
    })
  }
  if (hasPermission('menu:operation:seckill') || isAdmin) {
    dataSourceManagementChildren.push({
      key: '/admin/operation/seckill',
      label: '秒杀'
    })
  }
  if (hasPermission('menu:operation:groupbuy') || isAdmin) {
    dataSourceManagementChildren.push({
      key: '/admin/operation/groupbuy',
      label: '团购'
    })
  }
  if (hasPermission('menu:operation:productList') || isAdmin) {
    dataSourceManagementChildren.push({
      key: '/admin/operation/productList',
      label: '商品列表'
    })
  }
  if (hasPermission('menu:operation:guessYouLike') || isAdmin) {
    dataSourceManagementChildren.push({
      key: '/admin/operation/guessYouLike',
      label: '猜你喜欢'
    })
  }
  // 只有当有子菜单时才添加二级菜单
  if (dataSourceManagementChildren.length > 0) {
    operationMenu.push({
      key: 'data-source-management',
      label: '数据源管理',
      children: dataSourceManagementChildren
    })
  }

  // 系统管理菜单
  const systemMenu: any[] = []
  
  // 系统管理子菜单
  const systemManagementChildren: any[] = []
  if (hasPermission('menu:system:permission') || isAdmin) {
    systemManagementChildren.push({
      key: '/admin/system/permission',
      label: '权限管理'
    })
  }
  if (hasPermission('menu:system:role') || isAdmin) {
    systemManagementChildren.push({
      key: '/admin/system/role',
      label: '角色管理'
    })
  }
  if (hasPermission('menu:system:user') || isAdmin) {
    systemManagementChildren.push({
      key: '/admin/system/user',
      label: '用户管理'
    })
  }
  // 只有当有子菜单时才添加二级菜单
  if (systemManagementChildren.length > 0) {
    systemMenu.push({
      key: 'system-management',
      label: '系统管理',
      children: systemManagementChildren
    })
  }

  return {
    product: productMenu,
    operation: operationMenu,
    system: systemMenu
  }
}

// 默认路由组件：重定向到用户有权限的第一个页面
function DefaultRoute() {
  const permissions = getCurrentPermissions()
  const isAdmin = permissions.includes('admin') || permissions.some(p => p.startsWith('admin'))
  
  // 按优先级排序的菜单权限列表
  const menuRoutes = [
    { permission: 'menu:operation:page', path: '/admin/operation/page' },
    { permission: 'menu:product:list', path: '/admin/product/list' },
    { permission: 'menu:product:image:list', path: '/admin/operation/image/list' },
    { permission: 'menu:product:image:gallery', path: '/admin/operation/image/gallery' },
    { permission: 'menu:operation:carousel', path: '/admin/operation/carousel' },
    { permission: 'menu:operation:seckill', path: '/admin/operation/seckill' },
    { permission: 'menu:operation:groupbuy', path: '/admin/operation/groupbuy' },
    { permission: 'menu:operation:productList', path: '/admin/operation/productList' },
    { permission: 'menu:operation:guessYouLike', path: '/admin/operation/guessYouLike' },
    { permission: 'menu:system:permission', path: '/admin/system/permission' },
    { permission: 'menu:system:role', path: '/admin/system/role' },
    { permission: 'menu:system:user', path: '/admin/system/user' }
  ]
  
  // 找到用户有权限的第一个页面
  const firstAvailableRoute = menuRoutes.find(route => 
    isAdmin || hasPermission(route.permission)
  )
  
  // 如果找到有权限的页面，重定向过去；否则显示欢迎页面
  if (firstAvailableRoute) {
    return <Navigate to={firstAvailableRoute.path} replace />
  }
  
  return (
    <div className="admin-welcome">
      <AppstoreOutlined className="admin-welcome-icon" />
      <h2 className="admin-welcome-title">欢迎使用 Luxury Mall 管理后台</h2>
      <p className="admin-welcome-subtitle">您当前没有任何页面访问权限，请联系管理员</p>
    </div>
  )
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  // 获取当前用户信息
  const getCurrentUser = (): AdminUser | null => {
    const userStr = localStorage.getItem('admin_user')
    return userStr ? JSON.parse(userStr) : null
  }
  
  const currentUser = getCurrentUser()
  const username = currentUser?.username || '用户'
  
  // 获取初始选中的一级菜单：找到第一个有子菜单的一级菜单
  const getInitialTopMenu = (): string => {
    const sideMenuItems = getSideMenuItems()
    if (sideMenuItems.operation && sideMenuItems.operation.length > 0) {
      return 'operation'
    }
    if (sideMenuItems.product && sideMenuItems.product.length > 0) {
      return 'product'
    }
    if (sideMenuItems.system && sideMenuItems.system.length > 0) {
      return 'system'
    }
    return 'operation'
  }
  
  const [selectedTopMenu, setSelectedTopMenu] = useState<string>(getInitialTopMenu())
  
  // 获取初始展开的二级菜单
  const getInitialOpenKeys = (): string[] => {
    const sideMenuItems = getSideMenuItems()
    const menuItems = sideMenuItems[selectedTopMenu] || []
    if (menuItems.length > 0 && menuItems[0].key) {
      return [String(menuItems[0].key)]
    }
    return []
  }
  
  const [openKeys, setOpenKeys] = useState<string[]>(getInitialOpenKeys())

  // 处理退出登录
  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  // 用户菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true
    }
  ]

  // 处理一级菜单点击
  const handleTopMenuClick = ({ key }: { key: string }) => {
    const keyStr = String(key || '')
    const sideMenuItems = getSideMenuItems()
    const menuItems = sideMenuItems[keyStr] || []
    
    // 如果该一级菜单下没有任何子菜单，不切换
    if (menuItems.length === 0) {
      return
    }
    
    setSelectedTopMenu(keyStr)
    
    // 自动展开第一个二级菜单
    if (menuItems.length > 0 && menuItems[0].children && menuItems[0].children.length > 0) {
      const firstMenuKey = String(menuItems[0].key || '')
      const firstChildKey = String(menuItems[0].children[0].key || '')
      if (firstMenuKey && firstChildKey) {
        setOpenKeys([firstMenuKey])
        // 导航到第一个子菜单项
        navigate(firstChildKey)
      }
    }
  }

  // 处理二级三级菜单点击
  const handleSideMenuClick = ({ key }: { key: string }) => {
    const keyStr = String(key || '')
    if (keyStr.startsWith('/')) {
      navigate(keyStr)
    }
  }

  // 处理左侧菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = (): string[] => {
    const path = location.pathname
    if (typeof path !== 'string') {
      return []
    }
    if (path.includes('/admin/product/list')) {
      return ['/admin/product/list']
    } else if (path.includes('/admin/operation/page')) {
      return ['/admin/operation/page']
    } else if (path.includes('/admin/operation/image/list')) {
      return ['/admin/operation/image/list']
    } else if (path.includes('/admin/operation/image/gallery')) {
      return ['/admin/operation/image/gallery']
    } else if (path.includes('/admin/operation/carousel')) {
      return ['/admin/operation/carousel']
    } else if (path.includes('/admin/operation/seckill')) {
      return ['/admin/operation/seckill']
    } else if (path.includes('/admin/operation/groupbuy')) {
      return ['/admin/operation/groupbuy']
    } else if (path.includes('/admin/operation/productList')) {
      return ['/admin/operation/productList']
    } else if (path.includes('/admin/operation/guessYouLike')) {
      return ['/admin/operation/guessYouLike']
    } else if (path.includes('/admin/system/permission')) {
      return ['/admin/system/permission']
    } else if (path.includes('/admin/system/role')) {
      return ['/admin/system/role']
    } else if (path.includes('/admin/system/user')) {
      return ['/admin/system/user']
    }
    return []
  }

  // 初始化时根据路径设置选中的一级菜单和展开的二级菜单
  useEffect(() => {
    const path = location.pathname
    const sideMenuItems = getSideMenuItems()
    
    if (path.includes('/admin/product') || path.includes('/admin/operation/image')) {
      // 检查是否有商品中心的权限
      if (sideMenuItems.product && sideMenuItems.product.length > 0) {
        setSelectedTopMenu('product')
        // 根据路径决定展开哪个二级菜单
        const productMenu = sideMenuItems.product
        const openKeysToSet: string[] = []
        
        if (path.includes('/admin/product/list')) {
          const productManagement = productMenu.find((m: any) => m.key === 'product-management')
          if (productManagement && productManagement.key) {
            openKeysToSet.push(String(productManagement.key))
          }
        } else if (path.includes('/admin/operation/image/list') || path.includes('/admin/operation/image/gallery')) {
          const materialManagement = productMenu.find((m: any) => m.key === 'material-management')
          if (materialManagement && materialManagement.key) {
            openKeysToSet.push(String(materialManagement.key))
          }
        } else {
          // 展开所有有权限的二级菜单
          productMenu.forEach((m: any) => {
            if (m.children && m.children.length > 0 && m.key) {
              openKeysToSet.push(String(m.key))
            }
          })
        }
        setOpenKeys(openKeysToSet)
      }
    } else if (path.includes('/admin/operation')) {
      // 检查是否有运营中心的权限
      if (sideMenuItems.operation && sideMenuItems.operation.length > 0) {
        setSelectedTopMenu('operation')
        // 根据路径决定展开哪个二级菜单
        const operationMenu = sideMenuItems.operation
        const openKeysToSet: string[] = []
        
        if (path.includes('/admin/operation/page')) {
          const operationManagement = operationMenu.find((m: any) => m.key === 'operation-management')
          if (operationManagement && operationManagement.key) {
            openKeysToSet.push(String(operationManagement.key))
          }
        } else if (path.includes('/admin/operation/carousel') || 
                   path.includes('/admin/operation/seckill') || 
                   path.includes('/admin/operation/groupbuy') || 
                   path.includes('/admin/operation/productList') || 
                   path.includes('/admin/operation/guessYouLike')) {
          const dataSourceManagement = operationMenu.find((m: any) => m.key === 'data-source-management')
          if (dataSourceManagement && dataSourceManagement.key) {
            openKeysToSet.push(String(dataSourceManagement.key))
          }
        } else {
          // 展开所有有权限的二级菜单
          operationMenu.forEach((m: any) => {
            if (m.children && m.children.length > 0 && m.key) {
              openKeysToSet.push(String(m.key))
            }
          })
        }
        setOpenKeys(openKeysToSet)
      }
    } else if (path.includes('/admin/system')) {
      // 检查是否有系统管理的权限
      if (sideMenuItems.system && sideMenuItems.system.length > 0) {
        setSelectedTopMenu('system')
        // 系统管理菜单始终展开
        const systemMenu = sideMenuItems.system
        const openKeysToSet = systemMenu
          .filter((m: any) => m.key)
          .map((m: any) => String(m.key))
        setOpenKeys(openKeysToSet)
      }
    }
  }, [location.pathname])

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      {/* 顶部Header：一级菜单（横向） */}
      <Header className="admin-header">
        <div className="admin-logo">
          Luxury Mall
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedTopMenu]}
          items={getTopMenuItems()}
          onClick={handleTopMenuClick}
          theme="dark"
          className="admin-top-menu"
        />
        <div className="admin-user-actions">
          <div
            className="admin-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown
            menu={{
              items: userMenuItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  handleLogout()
                }
              }
            }}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<UserOutlined />}
              style={{ color: '#fff', marginRight: 16 }}
              className="admin-user-btn"
            >
              {username}
            </Button>
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* 左侧Sider：二级和三级菜单（纵向） */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={200}
          className="admin-sider"
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={getSelectedKeys()}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={getSideMenuItems()[selectedTopMenu] || []}
            onClick={handleSideMenuClick}
          />
        </Sider>

        {/* 右侧Content：页面内容 */}
        <Content className="admin-content">
          <Routes>
            <Route 
              path="product/list" 
              element={
                <PermissionRoute permission="menu:product:list">
                  <ProductList />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/page" 
              element={
                <PermissionRoute permission="menu:operation:page">
                  <PageManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/page/design/:id" 
              element={
                <PermissionRoute permission="menu:operation:page">
                  <PageDesigner />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/image/list" 
              element={
                <PermissionRoute permission="menu:product:image:list">
                  <ImageList />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/image/gallery" 
              element={
                <PermissionRoute permission="menu:product:image:gallery">
                  <ImageGallery />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/carousel" 
              element={
                <PermissionRoute permission="menu:operation:carousel">
                  <CarouselManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/seckill" 
              element={
                <PermissionRoute permission="menu:operation:seckill">
                  <SeckillManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/groupbuy" 
              element={
                <PermissionRoute permission="menu:operation:groupbuy">
                  <GroupbuyManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/productList" 
              element={
                <PermissionRoute permission="menu:operation:productList">
                  <ProductListManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="operation/guessYouLike" 
              element={
                <PermissionRoute permission="menu:operation:guessYouLike">
                  <GuessYouLikeManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="system/permission" 
              element={
                <PermissionRoute permission="menu:system:permission">
                  <PermissionManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="system/role" 
              element={
                <PermissionRoute permission="menu:system:role">
                  <RoleManagement />
                </PermissionRoute>
              } 
            />
            <Route 
              path="system/user" 
              element={
                <PermissionRoute permission="menu:system:user">
                  <UserManagement />
                </PermissionRoute>
              } 
            />
            <Route
              path=""
              element={<DefaultRoute />}
            />
            <Route path="*" element={<DefaultRoute />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout

