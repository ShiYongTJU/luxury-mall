import { Product } from '@/types/product'
import ProductCard from '../ProductCard/ProductCard'
import './GroupBuy.css'

interface GroupBuyProps {
  title: string
  products: Product[]
  onProductClick?: (product: Product) => void
}

const GroupBuy = ({ title, products, onProductClick }: GroupBuyProps) => {
  return (
    <div className="groupbuy-container">
      <div className="groupbuy-header">
        <h2 className="groupbuy-title">{title}</h2>
        <span className="groupbuy-badge">团购</span>
      </div>
      <div className="groupbuy-products">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick?.(product)}
          />
        ))}
      </div>
    </div>
  )
}

export default GroupBuy





