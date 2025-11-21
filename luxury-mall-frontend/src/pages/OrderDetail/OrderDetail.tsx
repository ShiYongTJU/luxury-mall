import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { getOrderById, payOrder, cancelOrder } from '@/api/api'
import type { Order } from '@/types/address'
import { toast } from '@/components/basic/Toast/Toast'
import { confirm } from '@/components/basic/Confirm/Confirm'
import './OrderDetail.css'

const OrderDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, loading: userLoading } = useUser()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const hasCheckedAuth = useRef(false) // 防止重复检查登录状态

  useEffect(() => {
    if (userLoading) return
    
    if (!isAuthenticated && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      toast.warning('请先登录')
      navigate('/login', { state: { from: `/order/${id}` } })
      return
    }
    
    if (isAuthenticated && id) {
      loadOrder()
    }
  }, [id, isAuthenticated, userLoading, navigate])

  const loadOrder = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const data = await getOrderById(id)
      if (!data) {
        toast.error('订单不存在')
        navigate('/orders')
        return
      }
      setOrder(data)
    } catch (error) {
      console.error('加载订单详情失败:', error)
      toast.error('加载订单详情失败')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: Order['status']) => {
    const statusMap = {
      pending: '待付款',
      paid: '待发货',
      shipped: '待收货',
      delivered: '已完成',
      cancelled: '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status: Order['status']) => {
    return `order-detail-status order-detail-status-${status}`
  }

  const handlePay = async () => {
    if (!order || !id) return

    try {
      setIsPaying(true)
      const updatedOrder = await payOrder(id)
      setOrder(updatedOrder)
      toast.success('支付成功')
    } catch (error: any) {
      console.error('支付失败:', error)
      toast.error(error.message || '支付失败，请稍后再试')
    } finally {
      setIsPaying(false)
    }
  }

  const handleCancel = async () => {
    if (!order || !id) return

    confirm.show({
      title: '取消订单',
      message: '确定要取消这个订单吗？取消后无法恢复。',
      confirmText: '确定取消',
      cancelText: '我再想想',
      type: 'warning',
      onConfirm: async () => {
        try {
          setIsCancelling(true)
          const updatedOrder = await cancelOrder(id)
          setOrder(updatedOrder)
          toast.success('订单已取消')
        } catch (error: any) {
          console.error('取消订单失败:', error)
          toast.error(error.message || '取消订单失败，请稍后再试')
        } finally {
          setIsCancelling(false)
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="order-detail">
        <div className="order-detail-loading">加载中...</div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="order-detail">
      <div className="order-detail-header">
        <h2 className="order-detail-title">订单详情</h2>
      </div>

      <div className="order-detail-content">
        {/* 订单状态 */}
        <div className="order-detail-section">
          <div className="order-detail-status-card">
            <div className="order-detail-status-info">
              <span className={getStatusClass(order.status)}>
                {getStatusText(order.status)}
              </span>
              <div className="order-detail-status-desc">
                {order.status === 'pending' && '请在30分钟内完成支付，超时订单将自动取消'}
                {order.status === 'paid' && '商家正在准备发货，请耐心等待'}
                {order.status === 'shipped' && '商品已发货，请注意查收'}
                {order.status === 'delivered' && '订单已完成，感谢您的购买'}
                {order.status === 'cancelled' && '订单已取消'}
              </div>
            </div>
          </div>
        </div>

        {/* 订单信息 */}
        <div className="order-detail-section">
          <h3 className="order-detail-section-title">订单信息</h3>
          <div className="order-detail-info-list">
            <div className="order-detail-info-item">
              <span className="order-detail-info-label">订单号：</span>
              <span className="order-detail-info-value">{order.orderNo}</span>
            </div>
            <div className="order-detail-info-item">
              <span className="order-detail-info-label">下单时间：</span>
              <span className="order-detail-info-value">
                {new Date(order.createTime).toLocaleString('zh-CN')}
              </span>
            </div>
            {order.payTime && (
              <div className="order-detail-info-item">
                <span className="order-detail-info-label">支付时间：</span>
                <span className="order-detail-info-value">
                  {new Date(order.payTime).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            {order.shipTime && (
              <div className="order-detail-info-item">
                <span className="order-detail-info-label">发货时间：</span>
                <span className="order-detail-info-value">
                  {new Date(order.shipTime).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
            {order.deliverTime && (
              <div className="order-detail-info-item">
                <span className="order-detail-info-label">完成时间：</span>
                <span className="order-detail-info-value">
                  {new Date(order.deliverTime).toLocaleString('zh-CN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 收货地址 */}
        <div className="order-detail-section">
          <h3 className="order-detail-section-title">收货地址</h3>
          <div className="order-detail-address">
            <div className="order-detail-address-header">
              <span className="order-detail-address-name">{order.address.name}</span>
              <span className="order-detail-address-phone">{order.address.phone}</span>
            </div>
            <div className="order-detail-address-detail">
              {order.address.province} {order.address.city} {order.address.district} {order.address.detail}
            </div>
          </div>
        </div>

        {/* 商品信息 */}
        <div className="order-detail-section">
          <h3 className="order-detail-section-title">商品信息</h3>
          <div className="order-detail-products">
            {order.items.map((item, index) => (
              <div key={index} className="order-detail-product">
                <img
                  src={item.image}
                  alt={item.name}
                  className="order-detail-product-image"
                />
                <div className="order-detail-product-info">
                  <h4 className="order-detail-product-name">{item.name}</h4>
                  {item.selectedSpecs && (
                    <p className="order-detail-product-specs">
                      {Object.values(item.selectedSpecs)
                        .map(spec => `${spec.specName}：${spec.label}`)
                        .join(' / ')}
                    </p>
                  )}
                  <div className="order-detail-product-footer">
                    <span className="order-detail-product-price">
                      ¥{item.price.toLocaleString()}
                    </span>
                    <span className="order-detail-product-quantity">
                      x{item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 费用明细 */}
        <div className="order-detail-section">
          <h3 className="order-detail-section-title">费用明细</h3>
          <div className="order-detail-summary">
            <div className="order-detail-summary-row">
              <span>商品合计</span>
              <span>¥{order.totalPrice.toLocaleString()}</span>
            </div>
            <div className="order-detail-summary-row">
              <span>运费</span>
              <span>免运费</span>
            </div>
            <div className="order-detail-summary-total">
              <span>实付金额</span>
              <span className="order-detail-total-price">¥{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 */}
      {(order.status === 'pending' || order.status === 'paid') && (
        <div className="order-detail-footer">
          <div className="order-detail-footer-wrapper">
            {order.status === 'pending' && (
              <>
                <button
                  className="order-detail-action-btn order-detail-action-btn-secondary"
                  onClick={handleCancel}
                  disabled={isCancelling}
                >
                  {isCancelling ? '取消中...' : '取消订单'}
                </button>
                <button
                  className="order-detail-action-btn order-detail-action-btn-primary"
                  onClick={handlePay}
                  disabled={isPaying}
                >
                  {isPaying ? '支付中...' : '立即支付'}
                </button>
              </>
            )}
            {order.status === 'paid' && (
              <button
                className="order-detail-action-btn order-detail-action-btn-secondary"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                {isCancelling ? '取消中...' : '取消订单'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail

