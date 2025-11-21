import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Product, Category } from '@/types/product'
import { getCategories } from '@/api/api'
import SearchBar from '@/components/business/SearchBar/SearchBar'
import './Category.css'

const Category = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement>>({})
  const activeSubCategoryRef = useRef<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
        if (cats.length > 0) {
          setSelectedCategory(cats[0].id)
        }
      } catch (error) {
        console.error('加载分类数据失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    // 切换一级分类时，重置选中的二级分类和引用
    sectionRefs.current = {}
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    // 延迟设置第一个二级分类为激活状态，等待DOM更新
    setTimeout(() => {
      const currentCategory = categories.find(c => c.id === selectedCategory)
      if (currentCategory && currentCategory.subCategories.length > 0) {
        const firstId = currentCategory.subCategories[0].id
        activeSubCategoryRef.current = firstId
        setActiveSubCategory(firstId)
      } else {
        activeSubCategoryRef.current = null
        setActiveSubCategory(null)
      }
    }, 0)
  }, [selectedCategory, categories])

  useEffect(() => {
    // 监听滚动，更新当前激活的二级分类
    const handleScroll = () => {
      if (!contentRef.current) return
      
      const scrollTop = contentRef.current.scrollTop
      const tabHeight = 50 // TAB选项卡的高度
      const sections = Object.entries(sectionRefs.current)
      
      // 找到当前显示在顶部（考虑TAB高度）的二级分类
      let currentActive = null
      for (let i = 0; i < sections.length; i++) {
        const [id, element] = sections[i]
        if (!element) continue
        
        const elementTop = element.offsetTop
        const elementBottom = elementTop + element.offsetHeight
        
        // 判断当前滚动位置是否在这个二级分类区域内
        // 考虑TAB高度，所以实际可视区域从 scrollTop + tabHeight 开始
        const viewportTop = scrollTop + tabHeight
        
        if (viewportTop >= elementTop && viewportTop < elementBottom) {
          currentActive = id
          break
        }
      }
      
      // 如果没有找到，则找最接近顶部的一个
      if (!currentActive && sections.length > 0) {
        let minDistance = Infinity
        for (const [id, element] of sections) {
          if (!element) continue
          const distance = Math.abs(element.offsetTop - scrollTop - tabHeight)
          if (distance < minDistance) {
            minDistance = distance
            currentActive = id
          }
        }
      }
      
      if (currentActive && currentActive !== activeSubCategoryRef.current) {
        activeSubCategoryRef.current = currentActive
        setActiveSubCategory(currentActive)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      // 初始检查一次
      setTimeout(() => {
        handleScroll()
      }, 100)
      contentElement.addEventListener('scroll', handleScroll)
      return () => {
        contentElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [selectedCategory])

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`)
  }

  const handleSubCategoryClick = (subCategoryId: string) => {
    const element = sectionRefs.current[subCategoryId]
    const tabsContainer = contentRef.current?.querySelector('.category-subcategory-tabs')
    const tabHeight = tabsContainer?.clientHeight || 50
    const scrollContainer = contentRef.current?.querySelector('.category-subcategories') as HTMLElement
    
    if (element && scrollContainer) {
      // 计算元素在滚动容器中的位置
      const elementTop = element.offsetTop
      const elementBottom = elementTop + element.offsetHeight
      const scrollTop = scrollContainer.scrollTop
      const containerHeight = scrollContainer.clientHeight
      
      // 计算可视区域的位置（考虑TAB高度）
      const viewportTop = scrollTop
      const viewportBottom = scrollTop + containerHeight
      
      // 判断元素是否完全在可视区域内
      const isFullyVisible = elementTop >= viewportTop && elementBottom <= viewportBottom
      
      if (!isFullyVisible) {
        // 如果元素不在可视区域内，滚动到可见位置
        // 计算目标滚动位置，让元素标题显示在TAB下方
        const targetScrollTop = elementTop - tabHeight
        
        scrollContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth'
        })
      }
      
      // 立即更新激活状态
      activeSubCategoryRef.current = subCategoryId
      setActiveSubCategory(subCategoryId)
    }
  }

  const currentCategory = categories.find(c => c.id === selectedCategory)

  if (loading) {
    return (
      <div className="category-loading">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="category">
      <SearchBar placeholder="搜索商品" />
      
      <div className="category-layout">
        <div className="category-sidebar">
          {categories.map((category) => (
            <div
              key={category.id}
              className={`category-sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-name">{category.name}</span>
            </div>
          ))}
        </div>

        <div className="category-content" ref={contentRef}>
          {currentCategory && currentCategory.subCategories.length > 0 ? (
            <>
              <div className="category-subcategory-tabs">
                {currentCategory.subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    className={`category-subcategory-tab ${activeSubCategory === subCategory.id ? 'active' : ''}`}
                    onClick={() => handleSubCategoryClick(subCategory.id)}
                  >
                    {subCategory.name}
                  </div>
                ))}
              </div>
              <div className="category-subcategories">
                {currentCategory.subCategories.map((subCategory) => (
                  <div
                    key={subCategory.id}
                    id={subCategory.id}
                    ref={(el) => {
                      if (el) {
                        sectionRefs.current[subCategory.id] = el
                      }
                    }}
                    className="category-subcategory-section"
                  >
                    <h3 className="subcategory-title">{subCategory.name}</h3>
                    {subCategory.products.length > 0 ? (
                      <div className="category-products">
                        {subCategory.products.map((product) => (
                          <div 
                            key={product.id} 
                            className="category-product-item" 
                            onClick={() => handleProductClick(product)}
                          >
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="category-product-image" 
                            />
                            <div className="category-product-info">
                              <h3 className="category-product-name">{product.name}</h3>
                              <p className="category-product-desc">{product.description}</p>
                              <div className="category-product-price">
                                <span className="price">¥{product.price.toLocaleString()}</span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="original-price">¥{product.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="category-empty">
                        <p>暂无商品</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="category-empty">
              <p>暂无分类数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Category
