import { useState, useEffect } from 'react'
import { Layout, Menu, theme } from 'antd'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import ProductList from '../../pages/Product/ProductList'
import PageManagement from '../../pages/Operation/PageManagement'
import ImageList from '../../pages/Operation/ImageList'
import CarouselManagement from '../../pages/Operation/CarouselManagement'
import SeckillManagement from '../../pages/Operation/SeckillManagement'
import GroupbuyManagement from '../../pages/Operation/GroupbuyManagement'
import ProductListManagement from '../../pages/Operation/ProductListManagement'
import GuessYouLikeManagement from '../../pages/Operation/GuessYouLikeManagement'

const { Header, Sider, Content } = Layout

// 一级菜单配置（顶部横向）
const topMenuItems = [
  {
    key: 'product',
    icon: <ShoppingOutlined />,
    label: '商品中心'
  },
  {
    key: 'operation',
    icon: <BarChartOutlined />,
    label: '运营中心'
  }
]

// 二级和三级菜单配置（左侧纵向）
const sideMenuItems: Record<string, any[]> = {
  product: [
    {
      key: 'product-management',
      label: '商品管理',
      children: [
        {
          key: '/admin/product/list',
          label: '商品列表'
        }
      ]
    }
  ],
  operation: [
    {
      key: 'operation-management',
      label: '运营管理',
      children: [
        {
          key: '/admin/operation/page',
          label: '页面管理'
        }
      ]
    },
    {
      key: 'material-management',
      label: '素材管理',
      children: [
        {
          key: '/admin/operation/image/list',
          label: '图片列表'
        }
      ]
    },
    {
      key: 'data-source-management',
      label: '数据源管理',
      children: [
        {
          key: '/admin/operation/carousel',
          label: '轮播图'
        },
        {
          key: '/admin/operation/seckill',
          label: '秒杀'
        },
        {
          key: '/admin/operation/groupbuy',
          label: '团购'
        },
        {
          key: '/admin/operation/productList',
          label: '商品列表'
        },
        {
          key: '/admin/operation/guessYouLike',
          label: '猜你喜欢'
        }
      ]
    }
  ]
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [selectedTopMenu, setSelectedTopMenu] = useState<string>('product')
  const [openKeys, setOpenKeys] = useState<string[]>(['product-management'])
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer }
  } = theme.useToken()

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
    }
    return []
  }

  // 初始化时根据路径设置选中的一级菜单和展开的二级菜单
  useEffect(() => {
    const path = location.pathname
    if (path.includes('/admin/product')) {
      setSelectedTopMenu('product')
      setOpenKeys(['product-management'])
    } else if (path.includes('/admin/operation')) {
      setSelectedTopMenu('operation')
      // 根据路径决定展开哪个二级菜单
      if (path.includes('/admin/operation/page')) {
        setOpenKeys(['operation-management'])
      } else if (path.includes('/admin/operation/image/list')) {
        setOpenKeys(['material-management'])
      } else if (path.includes('/admin/operation/carousel') || 
                 path.includes('/admin/operation/seckill') || 
                 path.includes('/admin/operation/groupbuy') || 
                 path.includes('/admin/operation/productList') || 
                 path.includes('/admin/operation/guessYouLike')) {
        setOpenKeys(['data-source-management'])
      } else {
        setOpenKeys(['operation-management', 'material-management', 'data-source-management'])
      }
    }
  }, [location.pathname])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部Header：一级菜单（横向） */}
      <Header
        style={{
          padding: 0,
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid #002140',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div
          style={{
            width: 200,
            padding: '0 24px',
            fontSize: 18,
            fontWeight: 'bold',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            borderRight: '1px solid #002140'
          }}
        >
          Luxury Mall
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[selectedTopMenu]}
          items={topMenuItems}
          onClick={handleTopMenuClick}
          theme="dark"
          style={{
            flex: 1,
            borderBottom: 'none',
            lineHeight: '64px',
            background: '#001529'
          }}
        />
        <div
          style={{
            padding: '0 24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            borderLeft: '1px solid #002140',
            color: '#fff'
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </Header>

      <Layout>
        {/* 左侧Sider：二级和三级菜单（纵向） */}
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={200}
          style={{
            background: '#001529',
            borderRight: '1px solid #002140'
          }}
        >
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={getSelectedKeys()}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={sideMenuItems[selectedTopMenu] || []}
            onClick={handleSideMenuClick}
            style={{
              height: '100%',
              borderRight: 0,
              background: '#001529'
            }}
          />
        </Sider>

        {/* 右侧Content：页面内容 */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8
          }}
        >
          <Routes>
            <Route path="/admin/product/list" element={<ProductList />} />
            <Route path="/admin/operation/page" element={<PageManagement />} />
            <Route path="/admin/operation/image/list" element={<ImageList />} />
            <Route path="/admin/operation/carousel" element={<CarouselManagement />} />
            <Route path="/admin/operation/seckill" element={<SeckillManagement />} />
            <Route path="/admin/operation/groupbuy" element={<GroupbuyManagement />} />
            <Route path="/admin/operation/productList" element={<ProductListManagement />} />
            <Route path="/admin/operation/guessYouLike" element={<GuessYouLikeManagement />} />
            <Route
              path="/admin"
              element={
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                  <AppstoreOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                  <h2 style={{ marginTop: 16 }}>欢迎使用 Luxury Mall 管理后台</h2>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/admin/product/list" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout

