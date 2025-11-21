import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Carousel.css'

interface CarouselItem {
  id: string
  image: string
  title?: string
  link?: string
}

interface CarouselProps {
  items: CarouselItem[]
  autoplay?: boolean
  interval?: number
  height?: string
}

const Carousel = ({ 
  items, 
  autoplay = true, 
  interval = 3000,
  height = '200px'
}: CarouselProps) => {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoplay || items.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoplay, interval, items.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }

  if (!items.length) return null

  return (
    <div className="carousel" style={{ height }}>
      <div 
        className="carousel-wrapper"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            className="carousel-item"
            onClick={() => {
              if (item.link) {
                navigate(item.link)
              }
            }}
            style={{ cursor: item.link ? 'pointer' : 'default' }}
          >
            <img src={item.image} alt={item.title || ''} className="carousel-image" />
            {item.title && (
              <div className="carousel-overlay">
                <h3 className="carousel-title">{item.title}</h3>
              </div>
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button className="carousel-btn carousel-btn-prev" onClick={goToPrev}>
            ‹
          </button>
          <button className="carousel-btn carousel-btn-next" onClick={goToNext}>
            ›
          </button>

          <div className="carousel-dots">
            {items.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default Carousel





