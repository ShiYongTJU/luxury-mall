import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomePageData, PageComponent, Product } from '@/types/product'
import { getHomePageData } from '@/api/api'
import SearchBar from '@/components/business/SearchBar/SearchBar'
import Carousel from '@/components/business/Carousel/Carousel'
import Seckill from '@/components/business/Seckill/Seckill'
import GroupBuy from '@/components/business/GroupBuy/GroupBuy'
import ProductList from '@/components/business/ProductList/ProductList'
import GuessYouLike from '@/components/business/GuessYouLike/GuessYouLike'
import './Home.css'

const Home = () => {
  const [pageData, setPageData] = useState<HomePageData | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getHomePageData()
        setPageData(data)
      } catch (error) {
        console.error('加载首页数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`)
  }

  const renderComponent = (component: PageComponent) => {
    // 防御性检查：确保 component 和 data 存在
    if (!component || component.data === undefined) {
      console.warn(`组件 ${component?.id || 'unknown'} 数据缺失，跳过渲染`)
      return null
    }

    // 提取样式配置
    const styleConfig = component.config || {}
    const {
      title,
      backgroundColor,
      padding,
      margin,
      ...otherConfig
    } = styleConfig

    // 构建样式对象
    const componentStyle: React.CSSProperties = {
      backgroundColor: backgroundColor || '#ffffff',
      padding: padding !== undefined ? `${padding}px` : undefined,
      margin: margin !== undefined ? `${margin}px` : undefined
    }

    // 渲染组件内容
    let componentContent: React.ReactNode = null

    switch (component.type) {
      case 'carousel':
        // 确保 data 是数组
        if (!Array.isArray(component.data)) {
          console.warn(`轮播图组件 ${component.id} 数据格式错误，期望数组`)
          return null
        }
        componentContent = (
          <Carousel
            items={component.data}
            {...otherConfig}
          />
        )
        break
      case 'seckill':
        // 确保 data 是对象，且包含 endTime 和 products
        if (typeof component.data !== 'object' || Array.isArray(component.data)) {
          console.warn(`秒杀组件 ${component.id} 数据格式错误，期望对象 { endTime, products }`)
          return null
        }
        const seckillData = component.data as { endTime?: string; products?: Product[] }
        if (!seckillData.endTime || !Array.isArray(seckillData.products)) {
          console.warn(`秒杀组件 ${component.id} 数据不完整，缺少 endTime 或 products`)
          return null
        }
        componentContent = (
          <Seckill
            title={title || '限时秒杀'}
            endTime={seckillData.endTime}
            products={seckillData.products}
            onProductClick={handleProductClick}
          />
        )
        break
      case 'groupbuy':
        // 确保 data 是对象，且包含 products
        if (typeof component.data !== 'object' || Array.isArray(component.data)) {
          console.warn(`团购组件 ${component.id} 数据格式错误，期望对象 { products }`)
          return null
        }
        const groupbuyData = component.data as { products?: Product[] }
        if (!Array.isArray(groupbuyData.products)) {
          console.warn(`团购组件 ${component.id} 数据不完整，缺少 products`)
          return null
        }
        componentContent = (
          <GroupBuy
            title={title || '热门团购'}
            products={groupbuyData.products}
            onProductClick={handleProductClick}
          />
        )
        break
      case 'productList':
        // 确保 data 是对象，且包含 products
        if (typeof component.data !== 'object' || Array.isArray(component.data)) {
          console.warn(`商品列表组件 ${component.id} 数据格式错误，期望对象 { products }`)
          return null
        }
        const productListData = component.data as { products?: Product[] }
        if (!Array.isArray(productListData.products)) {
          console.warn(`商品列表组件 ${component.id} 数据不完整，缺少 products`)
          return null
        }
        componentContent = (
          <ProductList
            title={title}
            products={productListData.products}
            columns={otherConfig.columns || 2}
            onProductClick={handleProductClick}
          />
        )
        break
      case 'guessYouLike':
        // 确保 data 是对象，且包含 products
        if (typeof component.data !== 'object' || Array.isArray(component.data)) {
          console.warn(`猜你喜欢组件 ${component.id} 数据格式错误，期望对象 { products }`)
          return null
        }
        const guessYouLikeData = component.data as { products?: Product[] }
        if (!Array.isArray(guessYouLikeData.products)) {
          console.warn(`猜你喜欢组件 ${component.id} 数据不完整，缺少 products`)
          return null
        }
        componentContent = (
          <GuessYouLike
            title={title || '猜你喜欢'}
            products={guessYouLikeData.products}
            onProductClick={handleProductClick}
          />
        )
        break
      default:
        console.warn(`未知的组件类型: ${component.type}`)
        return null
    }

    // 使用样式包装组件
    return (
      <div key={component.id} style={componentStyle}>
        {componentContent}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="home-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (!pageData) {
    return <div className="home-error">加载失败，请稍后重试</div>
  }

  return (
    <div className="home">
      <SearchBar placeholder="搜索商品" />
      {pageData.components.map(renderComponent)}
    </div>
  )
}

export default Home


