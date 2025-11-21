import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import './Profile.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useUser()

  const handleLogin = () => {
    navigate('/login', { state: { from: '/profile' } })
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="profile">
      <div className="profile-header">
        <h2 className="profile-title">我的</h2>
      </div>

      {isAuthenticated && user ? (
        <>
          <div className="profile-user-card">
            <div className="profile-avatar">
              <div className="avatar-placeholder">👤</div>
            </div>
            <div className="profile-info">
              <div className="profile-name-wrapper">
                <h2 className="profile-name">{user.username}</h2>
                <span className="profile-level">V0等级</span>
              </div>
              <p className="profile-desc">{user.phone}</p>
            </div>
            <button className="profile-header-btn">会员频道</button>
          </div>
        </>
      ) : (
        <div className="profile-user-card">
          <div className="profile-avatar">
            <div className="avatar-placeholder">👤</div>
          </div>
          <div className="profile-info">
            <div className="profile-name-wrapper">
              <h2 className="profile-name">未登录</h2>
            </div>
            <p className="profile-desc">登录后享受更多服务</p>
          </div>
          <button className="profile-header-btn" onClick={handleLogin}>
            登录
          </button>
        </div>
      )}

      <div className="profile-wallet">
        <div className="profile-wallet-item">
          <div className="profile-wallet-icon">⭐</div>
          <div className="profile-wallet-value">0</div>
          <div className="profile-wallet-label">积分</div>
        </div>
        <div className="profile-wallet-item">
          <div className="profile-wallet-icon">🎫</div>
          <div className="profile-wallet-value">0</div>
          <div className="profile-wallet-label">优惠券</div>
        </div>
        <div className="profile-wallet-item">
          <div className="profile-wallet-icon">💰</div>
          <div className="profile-wallet-value">0.00</div>
          <div className="profile-wallet-label">代金券</div>
        </div>
        <div className="profile-wallet-item">
          <div className="profile-wallet-icon">🎁</div>
          <div className="profile-wallet-value">0</div>
          <div className="profile-wallet-label">优购码</div>
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-section">
          <div className="menu-section-title">
            <span className="menu-section-title-text">我的订单</span>
            <span 
              className="menu-section-title-link"
              onClick={() => navigate('/orders')}
              style={{ cursor: 'pointer' }}
            >
              全部订单 ›
            </span>
          </div>
          <div className="menu-section-grid">
            <div className="menu-section-item">
              <div className="menu-section-icon">💳</div>
              <div className="menu-section-label">待付款</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">📦</div>
              <div className="menu-section-label">待收货</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">💬</div>
              <div className="menu-section-label">待评价</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">💰</div>
              <div className="menu-section-label">售后退款</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">♻️</div>
              <div className="menu-section-label">回收单</div>
            </div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-section-title">
            <span className="menu-section-title-text">常用服务</span>
            <span className="menu-section-title-link">联系客服 ›</span>
          </div>
          <div className="menu-section-grid">
            <div className="menu-section-item">
              <div className="menu-section-icon">🛍️</div>
              <div className="menu-section-label">服务商店</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">🛡️</div>
              <div className="menu-section-label">补购保障</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">💰</div>
              <div className="menu-section-label">价保申请</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">🔄</div>
              <div className="menu-section-label">以旧换新</div>
            </div>
            <div className="menu-section-item">
              <div className="menu-section-icon">📄</div>
              <div className="menu-section-label">发票服务</div>
            </div>
          </div>
        </div>

        <div className="menu-section">
          <div className="menu-item" onClick={() => navigate('/settings')}>
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">设置</span>
            <span className="menu-arrow">›</span>
          </div>
          {isAuthenticated && (
            <div className="menu-item" onClick={handleLogout}>
              <span className="menu-icon">🚪</span>
              <span className="menu-text">退出登录</span>
              <span className="menu-arrow">›</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile


