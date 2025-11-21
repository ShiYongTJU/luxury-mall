import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Carousel from '@/components/business/Carousel/Carousel'
import { getProductDetail } from '@/api/api'
import { Product, ProductSpec } from '@/types/product'
import { useCart, SelectedSpecValue } from '@/context/CartContext'
import { toast } from '@/components/basic/Toast/Toast'
import './ProductDetail.css'

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, SelectedSpecValue>>({})

  useEffect(() => {
    if (!id) {
      setError('未找到该商品')
      setLoading(false)
      return
    }

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const data = await getProductDetail(id)
        if (!data) {
          setError('商品不存在或已下架')
          return
        }
        setProduct(data)
      } catch (err) {
        console.error(err)
        setError('加载商品信息失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  useEffect(() => {
    setQuantity(1)
    setSelectedSpecs({})
  }, [product?.id])

  const imageItems = useMemo(() => {
    if (!product) return []
    const images = product.images?.length ? product.images : [product.image]
    return images.map((imageUrl, index) => ({
      id: `${product.id}-${index}`,
      image: imageUrl
    }))
  }, [product])

  const handleSelectSpec = (spec: ProductSpec, optionId: string, optionLabel: string) => {
    setSelectedSpecs((prev) => ({
      ...prev,
      [spec.id]: {
        id: optionId,
        label: optionLabel,
        specName: spec.name
      }
    }))
  }

  const isSpecsReady = useMemo(() => {
    if (!product?.specs?.length) return true
    return product.specs.every((spec) => selectedSpecs[spec.id])
  }, [product, selectedSpecs])

  const ensureSpecsSelected = () => {
    if (!isSpecsReady) {
      toast.warning('请选择完整的商品规格')
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!product) return
    if (!ensureSpecsSelected()) return
    addItem({ product, quantity, selectedSpecs })
    toast.success('已加入购物车')
  }

  const handleBuyNow = () => {
    if (!product) return
    if (!ensureSpecsSelected()) return
    addItem({ product, quantity, selectedSpecs })
    navigate('/cart')
  }

  const adjustQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  if (loading) {
    return (
      <div className="product-detail product-detail-loading">
        <div className="loading-spinner"></div>
        <p>商品加载中...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-detail product-detail-error">
        <p>{error || '未找到相关商品'}</p>
        <button className="detail-back-btn" onClick={() => navigate(-1)}>
          返回上一页
        </button>
      </div>
    )
  }

  return (
    <div className="product-detail">
      <div className="detail-carousel">
        <Carousel items={imageItems} autoplay height="320px" />
      </div>

      <div className="detail-summary">
        <p className="detail-brand">{product.brand}</p>
        <h1 className="detail-title">{product.name}</h1>
        <p className="detail-desc">{product.description}</p>
        <div className="detail-price-wrapper">
          <span className="detail-price">¥{product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="detail-original">¥{product.originalPrice.toLocaleString()}</span>
          )}
        </div>
        {typeof product.stock !== 'undefined' && (
          <p className="detail-stock">库存：{product.stock} 件</p>
        )}
      </div>

      <div className="detail-section">
        <h3>商品规格</h3>
        {product.specs?.length ? (
          product.specs.map((spec) => (
            <div key={spec.id} className="detail-spec">
              <div className="detail-spec-name">{spec.name}</div>
              <div className="detail-spec-options">
                {spec.options.map((option) => {
                  const isActive = selectedSpecs[spec.id]?.id === option.id
                  return (
                    <button
                      key={option.id}
                      className={`detail-spec-option ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectSpec(spec, option.id, option.label)}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <p className="detail-empty">该商品无需选择规格</p>
        )}

        <div className="detail-quantity">
          <span>数量</span>
          <div className="detail-quantity-actions">
            <button onClick={() => adjustQuantity(-1)} disabled={quantity <= 1}>
              -
            </button>
            <span>{quantity}</span>
            <button onClick={() => adjustQuantity(1)}>+</button>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h3>商品详情</h3>
        {product.detailDescription && <p className="detail-text">{product.detailDescription}</p>}
        {product.highlights && (
          <ul className="detail-highlights">
            {product.highlights.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="detail-section">
        <h3>用户评价</h3>
        {product.reviews?.length ? (
          product.reviews.map((review) => (
            <div key={review.id} className="detail-review">
              <img src={review.avatar} alt={review.user} className="detail-review-avatar" />
              <div className="detail-review-body">
                <div className="detail-review-header">
                  <span className="detail-review-user">{review.user}</span>
                  <span className="detail-review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                </div>
                {review.specSummary && (
                  <p className="detail-review-spec">已选：{review.specSummary}</p>
                )}
                <p className="detail-review-comment">{review.comment}</p>
                <span className="detail-review-date">{review.date}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="detail-empty">暂无评价</p>
        )}
      </div>

      <div className="detail-section">
        <h3>服务与配送</h3>
        {product.services && (
          <ul className="detail-services">
            {product.services.map((service) => (
              <li key={service}>{service}</li>
            ))}
          </ul>
        )}
        {product.shippingInfo && (
          <p className="detail-shipping">配送说明：{product.shippingInfo}</p>
        )}
      </div>

      <div className="detail-action-bar">
        <div className="detail-action-bar-wrapper">
          <div className="detail-action-price">
            <span className="detail-action-price-label">合计</span>
            <span className="detail-action-price-value">
              ¥{(product.price * quantity).toLocaleString()}
            </span>
          </div>
          <button className="detail-cart-btn" onClick={handleAddToCart}>
            加入购物车
          </button>
          <button className="detail-buy-btn" onClick={handleBuyNow}>
            立即购买
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

