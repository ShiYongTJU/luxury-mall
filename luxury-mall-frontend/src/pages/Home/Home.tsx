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
    if (!component || !component.data) {
      console.warn(`组件 ${component?.id || 'unknown'} 数据缺失，跳过渲染`)
      return null
    }

    switch (component.type) {
      case 'carousel':
        // 确保 data 是数组
        if (!Array.isArray(component.data)) {
          console.warn(`轮播图组件 ${component.id} 数据格式错误，期望数组`)
          return null
        }
        return (
          <Carousel
            key={component.id}
            items={component.data}
            {...component.config}
          />
        )
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
        return (
          <Seckill
            key={component.id}
            title={component.config.title || '限时秒杀'}
            endTime={seckillData.endTime}
            products={seckillData.products}
            onProductClick={handleProductClick}
          />
        )
      case 'groupbuy':
        // 确保 data 是数组
        if (!Array.isArray(component.data)) {
          console.warn(`团购组件 ${component.id} 数据格式错误，期望数组`)
          return null
        }
        return (
          <GroupBuy
            key={component.id}
            title={component.config.title || '热门团购'}
            products={component.data}
            onProductClick={handleProductClick}
          />
        )
      case 'productList':
        // 确保 data 是数组
        if (!Array.isArray(component.data)) {
          console.warn(`商品列表组件 ${component.id} 数据格式错误，期望数组`)
          return null
        }
        return (
          <ProductList
            key={component.id}
            title={component.config.title}
            products={component.data}
            columns={component.config.columns || 2}
            onProductClick={handleProductClick}
          />
        )
      case 'guessYouLike':
        // 确保 data 是数组
        if (!Array.isArray(component.data)) {
          console.warn(`猜你喜欢组件 ${component.id} 数据格式错误，期望数组`)
          return null
        }
        return (
          <GuessYouLike
            key={component.id}
            title={component.config.title || '猜你喜欢'}
            products={component.data}
            onProductClick={handleProductClick}
          />
        )
      default:
        console.warn(`未知的组件类型: ${component.type}`)
        return null
    }
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


