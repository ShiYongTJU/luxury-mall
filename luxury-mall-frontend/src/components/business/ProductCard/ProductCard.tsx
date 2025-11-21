import { Product } from '@/types/product'
import './ProductCard.css'

interface ProductCardProps {
  product: Product
  onClick?: () => void
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.tag && <span className="product-tag">{product.tag}</span>}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-price-wrapper">
          <span className="product-price">¥{product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-original-price">¥{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard





