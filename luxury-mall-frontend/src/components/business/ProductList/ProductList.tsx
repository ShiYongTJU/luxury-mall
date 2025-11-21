import { Product } from '@/types/product'
import ProductCard from '../ProductCard/ProductCard'
import './ProductList.css'

interface ProductListProps {
  products: Product[]
  columns?: 2 | 3 | 4
  title?: string
  onProductClick?: (product: Product) => void
}

const ProductList = ({ 
  products, 
  columns = 2, 
  title,
  onProductClick 
}: ProductListProps) => {
  return (
    <div className="product-list-container">
      {title && <h2 className="product-list-title">{title}</h2>}
      <div className={`product-list product-list-${columns}`}>
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

export default ProductList





