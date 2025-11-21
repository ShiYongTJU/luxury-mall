import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import './OrderSuccess.css'

const OrderSuccess = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearCart } = useCart()
  const orderNo = location.state?.orderNo || ''

  useEffect(() => {
    if (orderNo) {
      clearCart()
    }
  }, [orderNo, clearCart])

  return (
    <div className="order-success">
      <div className="order-success-content">
        <div className="order-success-icon">✓</div>
        <h1 className="order-success-title">订单提交成功</h1>
        {orderNo && (
          <p className="order-success-order-no">订单号：{orderNo}</p>
        )}
        <p className="order-success-message">感谢您的购买，我们会尽快为您安排发货</p>
        <div className="order-success-actions">
          <button className="order-success-btn" onClick={() => navigate('/')}>
            继续购物
          </button>
          <button className="order-success-btn order-success-btn-primary" onClick={() => navigate('/orders')}>
            查看订单
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess


