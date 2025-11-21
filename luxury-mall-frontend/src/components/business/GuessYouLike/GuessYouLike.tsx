import { Product } from '@/types/product'
import ProductList from '../ProductList/ProductList'
import './GuessYouLike.css'

interface GuessYouLikeProps {
  title?: string
  products: Product[]
  onProductClick?: (product: Product) => void
}

const GuessYouLike = ({ 
  title = '猜你喜欢', 
  products, 
  onProductClick 
}: GuessYouLikeProps) => {
  return (
    <div className="guess-you-like-container">
      <ProductList
        title={title}
        products={products}
        columns={2}
        onProductClick={onProductClick}
      />
    </div>
  )
}

export default GuessYouLike





