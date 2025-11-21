import { useNavigate } from 'react-router-dom'
import './SearchBar.css'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (value: string) => void
  onScanClick?: () => void
  autoNavigate?: boolean // 是否自动跳转到搜索页面
}

const SearchBar = ({ placeholder = '搜索商品', onSearch, onScanClick, autoNavigate = true }: SearchBarProps) => {
  const navigate = useNavigate()

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = (e.target as HTMLInputElement).value.trim()
      if (value) {
        if (autoNavigate) {
          navigate(`/search?q=${encodeURIComponent(value)}`)
        }
        if (onSearch) {
          onSearch(value)
        }
      }
    }
  }

  const handleInputClick = () => {
    if (autoNavigate) {
      navigate('/search')
    }
  }

  return (
    <div className="search-bar">
      <div className="search-input-wrapper" onClick={handleInputClick}>
        <span className="search-icon">🔍</span>
        <input 
          type="text" 
          className="search-input" 
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          readOnly={autoNavigate}
        />
      </div>
      <button className="scan-btn" onClick={onScanClick}>
        <span className="scan-icon">📷</span>
      </button>
    </div>
  )
}

export default SearchBar



