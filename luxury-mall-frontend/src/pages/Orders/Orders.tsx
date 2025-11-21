import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/context/UserContext'
import { getOrders } from '@/api/api'
import type { Order } from '@/types/address'
import { toast } from '@/components/basic/Toast/Toast'
import './Orders.css'

const Orders = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: userLoading } = useUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'>('all')
  const hasCheckedAuth = useRef(false) // 防止重复检查登录状态

  useEffect(() => {
    if (userLoading) return
    
    if (!isAuthenticated && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      toast.warning('请先登录')
      navigate('/login', { state: { from: '/orders' } })
      return
    }
    
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated, userLoading, navigate])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      // 按创建时间倒序排列
      const sortedData = data.sort((a, b) => 
        new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
      )
      setOrders(sortedData)
    } catch (error) {
      console.error('加载订单列表失败:', error)
      toast.error('加载订单列表失败')
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
    return `order-status order-status-${status}`
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const handleOrderClick = (orderId: string) => {
    navigate(`/order/${orderId}`)
  }

  if (loading) {
    return (
      <div className="orders">
        <div className="orders-header">
          <h2 className="orders-title">我的订单</h2>
        </div>
        <div className="orders-loading">加载中...</div>
      </div>
    )
  }

  return (
    <div className="orders">
      <div className="orders-header">
        <h2 className="orders-title">我的订单</h2>
      </div>

      <div className="orders-filter">
        <button
          className={`orders-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          全部订单
        </button>
        <button
          className={`orders-filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          待付款
        </button>
        <button
          className={`orders-filter-btn ${filter === 'paid' ? 'active' : ''}`}
          onClick={() => setFilter('paid')}
        >
          待发货
        </button>
        <button
          className={`orders-filter-btn ${filter === 'shipped' ? 'active' : ''}`}
          onClick={() => setFilter('shipped')}
        >
          待收货
        </button>
        <button
          className={`orders-filter-btn ${filter === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilter('delivered')}
        >
          已完成
        </button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <p className="orders-empty-text">暂无订单</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="order-item"
              onClick={() => handleOrderClick(order.id)}
            >
              <div className="order-item-header">
                <div className="order-item-info">
                  <span className="order-item-no">订单号：{order.orderNo}</span>
                  <span className="order-item-time">
                    {new Date(order.createTime).toLocaleString('zh-CN')}
                  </span>
                </div>
                <span className={getStatusClass(order.status)}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="order-item-content">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-product">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-product-image"
                    />
                    <div className="order-item-product-info">
                      <h4 className="order-item-product-name">{item.name}</h4>
                      {item.selectedSpecs && (
                        <p className="order-item-product-specs">
                          {Object.values(item.selectedSpecs)
                            .map(spec => `${spec.specName}：${spec.label}`)
                            .join(' / ')}
                        </p>
                      )}
                      <div className="order-item-product-price">
                        ¥{item.price.toLocaleString()} x {item.quantity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-item-footer">
                <div className="order-item-total">
                  共{order.items.reduce((sum, item) => sum + item.quantity, 0)}件商品
                  <span className="order-item-total-price">
                    合计：¥{order.totalPrice.toLocaleString()}
                  </span>
                </div>
                {order.status === 'pending' && (
                  <button
                    className="order-item-action-btn order-item-action-btn-primary"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/order/${order.id}`)
                    }}
                  >
                    立即支付
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    className="order-item-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/order/${order.id}`)
                    }}
                  >
                    查看物流
                  </button>
                )}
                {order.status === 'delivered' && (
                  <button
                    className="order-item-action-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/order/${order.id}`)
                    }}
                  >
                    再次购买
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Orders

