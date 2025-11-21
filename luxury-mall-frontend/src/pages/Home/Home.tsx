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
    switch (component.type) {
      case 'carousel':
        return (
          <Carousel
            key={component.id}
            items={component.data}
            {...component.config}
          />
        )
      case 'seckill':
        return (
          <Seckill
            key={component.id}
            title={component.config.title || '限时秒杀'}
            endTime={component.data.endTime}
            products={component.data.products}
            onProductClick={handleProductClick}
          />
        )
      case 'groupbuy':
        return (
          <GroupBuy
            key={component.id}
            title={component.config.title || '热门团购'}
            products={component.data}
            onProductClick={handleProductClick}
          />
        )
      case 'productList':
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
        return (
          <GuessYouLike
            key={component.id}
            title={component.config.title || '猜你喜欢'}
            products={component.data}
            onProductClick={handleProductClick}
          />
        )
      default:
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


