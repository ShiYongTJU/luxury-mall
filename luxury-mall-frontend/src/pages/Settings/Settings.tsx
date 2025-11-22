import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { useTheme } from '@/context/ThemeContext'
import { toast } from '@/components/basic/Toast/Toast'
import AddressManagement from './AddressManagement'
import './Settings.css'

const Settings = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: userLoading } = useUser()
  const { toggleTheme, isDark } = useTheme()
  const [activeSection, setActiveSection] = useState<'main' | 'address'>('main')
  const hasCheckedAuth = useRef(false) // 防止重复检查登录状态

  useEffect(() => {
    if (userLoading) return
    
    if (!isAuthenticated && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      toast.warning('请先登录')
      navigate('/login', { state: { from: '/settings' } })
      return
    }
  }, [isAuthenticated, userLoading, navigate])

  const handleBack = () => {
    if (activeSection === 'address') {
      setActiveSection('main')
    } else {
      navigate('/profile')
    }
  }

  if (activeSection === 'address') {
    return <AddressManagement onBack={handleBack} />
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={handleBack}>
          ‹
        </button>
        <h2 className="settings-title">设置</h2>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <div className="settings-section-title">账户管理</div>
          <div className="settings-menu">
            <div 
              className="settings-menu-item"
              onClick={() => setActiveSection('address')}
            >
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">📍</span>
                <span className="settings-menu-text">收货地址管理</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">🔐</span>
                <span className="settings-menu-text">账户安全</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">📱</span>
                <span className="settings-menu-text">绑定手机</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">通用设置</div>
          <div className="settings-menu">
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">🔔</span>
                <span className="settings-menu-text">消息通知</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item" onClick={toggleTheme}>
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">{isDark ? '🌙' : '☀️'}</span>
                <span className="settings-menu-text">深色模式</span>
              </div>
              <div className="settings-menu-item-right">
                <div className="theme-switch">
                  <div className={`theme-switch-slider ${isDark ? 'theme-switch-slider-dark' : ''}`}></div>
                </div>
                <span className="settings-menu-value">{isDark ? '深色' : '浅色'}</span>
              </div>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">🌐</span>
                <span className="settings-menu-text">语言设置</span>
              </div>
              <div className="settings-menu-item-right">
                <span className="settings-menu-value">简体中文</span>
                <span className="settings-menu-arrow">›</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">关于</div>
          <div className="settings-menu">
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">ℹ️</span>
                <span className="settings-menu-text">关于我们</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">📋</span>
                <span className="settings-menu-text">用户协议</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">🔒</span>
                <span className="settings-menu-text">隐私政策</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">📞</span>
                <span className="settings-menu-text">联系客服</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-menu">
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">📦</span>
                <span className="settings-menu-text">清除缓存</span>
              </div>
              <span className="settings-menu-arrow">›</span>
            </div>
            <div className="settings-menu-item">
              <div className="settings-menu-item-left">
                <span className="settings-menu-icon">🔄</span>
                <span className="settings-menu-text">检查更新</span>
              </div>
              <div className="settings-menu-item-right">
                <span className="settings-menu-value">v1.0.0</span>
                <span className="settings-menu-arrow">›</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

