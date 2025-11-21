import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { toast } from '@/components/basic/Toast/Toast'
import './Register.css'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useUser()
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 验证用户名
    if (!formData.username || formData.username.trim().length < 2 || formData.username.trim().length > 20) {
      toast.warning('用户名长度为2-20个字符')
      return
    }

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

    // 验证确认密码
    if (formData.password !== formData.confirmPassword) {
      toast.warning('两次输入的密码不一致')
      return
    }

    try {
      setLoading(true)
      await register(
        formData.username.trim(),
        formData.phone,
        formData.password,
        formData.email.trim() || undefined
      )
      // 注册成功后跳转
      navigate('/')
    } catch (error) {
      // 错误已在register中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register">
      <div className="register-header">
        <h2 className="register-title">注册</h2>
      </div>

      <div className="register-content">
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-form-group">
            <label>用户名 <span className="register-required">*</span></label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="请输入用户名（2-20个字符）"
              required
              maxLength={20}
            />
          </div>

          <div className="register-form-group">
            <label>手机号 <span className="register-required">*</span></label>
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

          <div className="register-form-group">
            <label>邮箱（可选）</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="请输入邮箱"
            />
          </div>

          <div className="register-form-group">
            <label>密码 <span className="register-required">*</span></label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="请输入密码（至少6位）"
              required
              minLength={6}
            />
          </div>

          <div className="register-form-group">
            <label>确认密码 <span className="register-required">*</span></label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="请再次输入密码"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="register-footer">
          <Link to="/login" className="register-link">
            已有账号？立即登录
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register


