import { useState, useEffect } from 'react'
import { Product } from '@/types/product'
import ProductCard from '../ProductCard/ProductCard'
import './Seckill.css'

interface SeckillProps {
  title: string
  endTime: string
  products: Product[]
  onProductClick?: (product: Product) => void
}

const Seckill = ({ title, endTime, products, onProductClick }: SeckillProps) => {
  const formatTime = (timeStr: string) => {
    const end = new Date(timeStr).getTime()
    const now = Date.now()
    const diff = Math.max(0, end - now)
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
      isEnded: diff === 0
    }
  }

  const [timeLeft, setTimeLeft] = useState(formatTime(endTime))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(formatTime(endTime))
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <div className="seckill-container">
      <div className="seckill-header">
        <div className="seckill-title-wrapper">
          <h2 className="seckill-title">{title}</h2>
          {!timeLeft.isEnded && (
            <div className="seckill-countdown">
              <span className="countdown-label">距结束</span>
              <span className="countdown-time">{timeLeft.hours}</span>
              <span className="countdown-separator">:</span>
              <span className="countdown-time">{timeLeft.minutes}</span>
              <span className="countdown-separator">:</span>
              <span className="countdown-time">{timeLeft.seconds}</span>
            </div>
          )}
        </div>
      </div>
      <div className="seckill-products">
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

export default Seckill





