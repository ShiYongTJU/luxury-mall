import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchProducts } from '@/api/api'
import type { Product } from '@/types/product'
import ProductCard from '@/components/business/ProductCard/ProductCard'
import './Search.css'

const Search = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [keyword, setKeyword] = useState(searchParams.get('q') || '')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])

  useEffect(() => {
    // 从localStorage读取搜索历史
    const history = JSON.parse(localStorage.getItem('luxury-mall-search-history') || '[]')
    setSearchHistory(history)
  }, [])

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setKeyword(query)
      handleSearch(query)
    }
  }, [searchParams])

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword || searchKeyword.trim() === '') {
      setProducts([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const results = await searchProducts(searchKeyword.trim())
      setProducts(results)

      // 保存搜索历史
      if (searchKeyword.trim()) {
        const history = JSON.parse(localStorage.getItem('luxury-mall-search-history') || '[]')
        const newHistory = [searchKeyword.trim(), ...history.filter((h: string) => h !== searchKeyword.trim())].slice(0, 10)
        localStorage.setItem('luxury-mall-search-history', JSON.stringify(newHistory))
        setSearchHistory(newHistory)
      }
    } catch (error) {
      console.error('搜索失败:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSubmit = (value: string) => {
    if (value.trim()) {
      setSearchParams({ q: value.trim() })
      handleSearch(value.trim())
    }
  }

  const handleHistoryClick = (historyKeyword: string) => {
    setKeyword(historyKeyword)
    setSearchParams({ q: historyKeyword })
    handleSearch(historyKeyword)
  }

  const handleClearHistory = () => {
    localStorage.removeItem('luxury-mall-search-history')
    setSearchHistory([])
  }

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`)
  }

  return (
    <div className="search-page">
      <div className="search-page-header">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="搜索商品"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit(keyword)
                }
              }}
            />
          </div>
        </div>
      </div>

      {!hasSearched && keyword === '' ? (
        <div className="search-page-content">
          {searchHistory.length > 0 && (
            <div className="search-history">
              <div className="search-history-header">
                <h3>搜索历史</h3>
                <button className="search-history-clear" onClick={handleClearHistory}>
                  清空
                </button>
              </div>
              <div className="search-history-list">
                {searchHistory.map((item, index) => (
                  <div
                    key={index}
                    className="search-history-item"
                    onClick={() => handleHistoryClick(item)}
                  >
                    <span className="search-history-icon">🕐</span>
                    <span className="search-history-text">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="search-hot">
            <h3>热门搜索</h3>
            <div className="search-hot-list">
              {['手袋', '手表', '配饰', '服装', '鞋履', '珠宝'].map((item) => (
                <div
                  key={item}
                  className="search-hot-item"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>搜索中...</p>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="search-results-header">
                <p className="search-results-count">找到 {products.length} 个相关商品</p>
              </div>
              <div className="search-results-list">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => handleProductClick(product)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="search-empty">
              <div className="search-empty-icon">🔍</div>
              <p className="search-empty-text">没有找到相关商品</p>
              <p className="search-empty-hint">试试其他关键词吧</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Search

