import { useState, useEffect, useRef } from 'react'
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
  const [currentIndex, setCurrentIndex] = useState(1) // 从1开始，因为0是克隆的最后一张
  const [isHovering, setIsHovering] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // 创建无限循环的图片数组：最后一张 + 所有图片 + 第一张
  const extendedItems = items.length > 1 
    ? [items[items.length - 1], ...items, items[0]]
    : items

  // 初始化时确保位置正确
  useEffect(() => {
    if (items.length > 1 && wrapperRef.current) {
      // 确保从真实的第一张开始
      setIsTransitioning(false)
      setCurrentIndex(1)
      setTimeout(() => setIsTransitioning(true), 50)
    }
  }, [items.length])

  useEffect(() => {
    if (!autoplay || items.length <= 1 || isHovering) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        // 如果到达最后一张（克隆的第一张），平滑跳转到真实的第一张
        if (next >= extendedItems.length - 1) {
          setTimeout(() => {
            setIsTransitioning(false)
            setCurrentIndex(1)
            setTimeout(() => setIsTransitioning(true), 50)
          }, 500) // 等待过渡动画完成
          return next
        }
        return next
      })
    }, interval)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [autoplay, interval, items.length, extendedItems.length, isHovering])

  const goToSlide = (index: number) => {
    setCurrentIndex(index + 1) // +1 因为第一张是克隆的最后一张
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => {
      const next = prev - 1
      // 如果到达第一张（克隆的最后一张），平滑跳转到真实的最后一张
      if (next <= 0) {
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(extendedItems.length - 2)
          setTimeout(() => setIsTransitioning(true), 50)
        }, 500)
        return next
      }
      return next
    })
  }

  const goToNext = () => {
    setCurrentIndex((prev) => {
      const next = prev + 1
      // 如果到达最后一张（克隆的第一张），平滑跳转到真实的第一张
      if (next >= extendedItems.length - 1) {
        setTimeout(() => {
          setIsTransitioning(false)
          setCurrentIndex(1)
          setTimeout(() => setIsTransitioning(true), 50)
        }, 500)
        return next
      }
      return next
    })
  }

  if (!items.length) return null

  // 如果只有一张图片，不需要无限循环
  if (items.length === 1) {
    return (
      <div 
        className="carousel" 
        style={{ height }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="carousel-wrapper">
          <div 
            className="carousel-item"
            onClick={() => {
              if (items[0].link) {
                navigate(items[0].link)
              }
            }}
            style={{ cursor: items[0].link ? 'pointer' : 'default' }}
          >
            <img src={items[0].image} alt={items[0].title || ''} className="carousel-image" />
            {items[0].title && (
              <div className="carousel-overlay">
                <h3 className="carousel-title">{items[0].title}</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="carousel" 
      style={{ height }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div 
        ref={wrapperRef}
        className="carousel-wrapper"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
        }}
      >
        {extendedItems.map((item, index) => (
          <div 
            key={`${item.id}-${index}`} 
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
            {items.map((_, index) => {
              // 计算当前真实索引（排除克隆的图片）
              const realIndex = currentIndex === 0 
                ? items.length - 1 
                : currentIndex === extendedItems.length - 1 
                ? 0 
                : currentIndex - 1
              return (
                <button
                  key={index}
                  className={`carousel-dot ${index === realIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Carousel





