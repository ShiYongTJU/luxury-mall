import { useState, useEffect } from 'react'
import { Layout, Menu, Dropdown, Button, Spin } from 'antd'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
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
import { hasPermission, adminLogout, getCurrentPermissions } from '../../api/auth'
import './AppLayout.css'

const { Header, Sider, Content } = Layout

// 一级菜单配置（顶部横向）
const getTopMenuItems = () => {
  const items: any[] = [
    {
      key: 'operation',
      icon: <BarChartOutlined />,
      label: '运营中心'
    },
    {
      key: 'product',
      icon: <ShoppingOutlined />,
      label: '商品中心'
    }
  ]

  // 根据权限显示系统管理菜单
  if (hasPermission('menu:system') || hasPermission('admin')) {
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

  return {
    product: [
      {
        key: 'product-management',
        label: '商品管理',
        children: [
          ...(hasPermission('menu:product:list') || isAdmin ? [{
            key: '/admin/product/list',
            label: '商品列表'
          }] : [])
        ]
      },
      {
        key: 'material-management',
        label: '素材管理',
        children: [
          ...(hasPermission('menu:product:image:list') || isAdmin ? [{
            key: '/admin/operation/image/list',
            label: '图片列表'
          }] : []),
          ...(hasPermission('menu:product:image:gallery') || isAdmin ? [{
            key: '/admin/operation/image/gallery',
            label: '静态资源'
          }] : [])
        ]
      }
    ],
    operation: [
      {
        key: 'operation-management',
        label: '运营管理',
        children: [
          ...(hasPermission('menu:operation:page') || isAdmin ? [{
            key: '/admin/operation/page',
            label: '页面管理'
          }] : [])
        ]
      },
      {
        key: 'data-source-management',
        label: '数据源管理',
        children: [
          ...(hasPermission('menu:operation:carousel') || isAdmin ? [{
            key: '/admin/operation/carousel',
            label: '轮播图'
          }] : []),
          ...(hasPermission('menu:operation:seckill') || isAdmin ? [{
            key: '/admin/operation/seckill',
            label: '秒杀'
          }] : []),
          ...(hasPermission('menu:operation:groupbuy') || isAdmin ? [{
            key: '/admin/operation/groupbuy',
            label: '团购'
          }] : []),
          ...(hasPermission('menu:operation:productList') || isAdmin ? [{
            key: '/admin/operation/productList',
            label: '商品列表'
          }] : []),
          ...(hasPermission('menu:operation:guessYouLike') || isAdmin ? [{
            key: '/admin/operation/guessYouLike',
            label: '猜你喜欢'
          }] : [])
        ]
      }
    ],
    system: [
      {
        key: 'system-management',
        label: '系统管理',
        children: [
          ...(hasPermission('menu:system:permission') || isAdmin ? [{
            key: '/admin/system/permission',
            label: '权限管理'
          }] : []),
          ...(hasPermission('menu:system:role') || isAdmin ? [{
            key: '/admin/system/role',
            label: '角色管理'
          }] : []),
          ...(hasPermission('menu:system:user') || isAdmin ? [{
            key: '/admin/system/user',
            label: '用户管理'
          }] : [])
        ]
      }
    ]
  }
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedTopMenu, setSelectedTopMenu] = useState<string>('operation')
  const [openKeys, setOpenKeys] = useState<string[]>(['operation-management'])
  const navigate = useNavigate()
  const location = useLocation()

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
    setSelectedTopMenu(key)
    // 如果切换到运营中心，可以在这里处理
    if (key === 'operation') {
      // 运营中心暂无子菜单，可以显示提示或默认页面
    }
  }

  // 处理二级三级菜单点击
  const handleSideMenuClick = ({ key }: { key: string }) => {
    if (key.startsWith('/')) {
      navigate(key)
    }
  }

  // 处理左侧菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
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
    if (path.includes('/admin/product') || path.includes('/admin/operation/image')) {
      setSelectedTopMenu('product')
      // 根据路径决定展开哪个二级菜单
      if (path.includes('/admin/product/list')) {
        setOpenKeys(['product-management'])
      } else if (path.includes('/admin/operation/image/list') || path.includes('/admin/operation/image/gallery')) {
        setOpenKeys(['material-management'])
      } else {
        setOpenKeys(['product-management', 'material-management'])
      }
    } else if (path.includes('/admin/operation')) {
      setSelectedTopMenu('operation')
      // 根据路径决定展开哪个二级菜单
      if (path.includes('/admin/operation/page')) {
        setOpenKeys(['operation-management'])
      } else if (path.includes('/admin/operation/carousel') || 
                 path.includes('/admin/operation/seckill') || 
                 path.includes('/admin/operation/groupbuy') || 
                 path.includes('/admin/operation/productList') || 
                 path.includes('/admin/operation/guessYouLike')) {
        setOpenKeys(['data-source-management'])
      } else {
        setOpenKeys(['operation-management', 'data-source-management'])
      }
    } else if (path.includes('/admin/system')) {
      setSelectedTopMenu('system')
      // 系统管理菜单始终展开
      setOpenKeys(['system-management'])
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
              用户
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
            <Route path="product/list" element={<ProductList />} />
            <Route path="operation/page" element={<PageManagement />} />
            <Route path="operation/page/design/:id" element={<PageDesigner />} />
            <Route path="operation/image/list" element={<ImageList />} />
            <Route path="operation/image/gallery" element={<ImageGallery />} />
            <Route path="operation/carousel" element={<CarouselManagement />} />
            <Route path="operation/seckill" element={<SeckillManagement />} />
            <Route path="operation/groupbuy" element={<GroupbuyManagement />} />
            <Route path="operation/productList" element={<ProductListManagement />} />
            <Route path="operation/guessYouLike" element={<GuessYouLikeManagement />} />
            <Route path="system/permission" element={<PermissionManagement />} />
            <Route path="system/role" element={<RoleManagement />} />
            <Route path="system/user" element={<UserManagement />} />
            <Route
              path=""
              element={
                <div className="admin-welcome">
                  <AppstoreOutlined className="admin-welcome-icon" />
                  <h2 className="admin-welcome-title">欢迎使用 Luxury Mall 管理后台</h2>
                  <p className="admin-welcome-subtitle">高效、安全、专业的管理平台</p>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/admin/operation/page" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout

