import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { toast } from '@/components/basic/Toast/Toast'
import './Login.css'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useUser()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      toast.warning('请输入正确的11位手机号码')
      return
    }

    // 验证密码
    if (formData.password.length < 6) {
      toast.warning('密码长度至少6位')
      return
    }

    try {
      setLoading(true)
      await login(formData.phone, formData.password)
      // 登录成功后跳转
      const from = new URLSearchParams(window.location.search).get('from') || '/'
      navigate(from)
    } catch (error) {
      // 错误已在login中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-header">
        <h2 className="login-title">登录</h2>
      </div>

      <div className="login-content">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>手机号</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '')
                if (value.length <= 11) {
                  setFormData({ ...formData, phone: value })
                }
              }}
              placeholder="请输入手机号"
              required
              maxLength={11}
            />
          </div>

          <div className="login-form-group">
            <label>密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="请输入密码（至少6位）"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/register" className="login-link">
            还没有账号？立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login


