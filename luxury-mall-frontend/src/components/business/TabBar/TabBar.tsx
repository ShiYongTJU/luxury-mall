import { useNavigate, useLocation } from 'react-router-dom'
import './TabBar.css'

const TabBar = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { path: '/', icon: '🏠', label: '首页' },
    { path: '/category', icon: '📱', label: '分类' },
    { path: '/cart', icon: '🛒', label: '购物车' },
    { path: '/profile', icon: '👤', label: '我的' },
  ]

  return (
    <div className="tab-bar">
      <div className="tab-bar-wrapper">
        {tabs.map((tab) => (
          <div
            key={tab.path}
            className={`tab-item ${location.pathname === tab.path ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TabBar


