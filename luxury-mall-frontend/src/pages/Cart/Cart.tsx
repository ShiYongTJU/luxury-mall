import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { confirm } from '@/components/basic/Confirm/Confirm'
import './Cart.css'

const Cart = () => {
  const navigate = useNavigate()
  const { items: cartItems, updateQuantity, removeItem } = useCart()

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleDecrease = (uid: string, quantity: number, itemName: string) => {
    if (quantity <= 1) {
      // 减少到0时，弹出确认对话框
      confirm.show({
        title: '删除商品',
        message: `确定要从购物车中删除"${itemName}"吗？`,
        confirmText: '确定删除',
        cancelText: '取消',
        type: 'danger',
        onConfirm: () => {
          removeItem(uid)
        }
      })
      return
    }
    updateQuantity(uid, quantity - 1)
  }

  const handleIncrease = (uid: string, quantity: number) => {
    updateQuantity(uid, quantity + 1)
  }

  const handleRemove = (uid: string, itemName: string) => {
    confirm.show({
      title: '删除商品',
      message: `确定要从购物车中删除"${itemName}"吗？`,
      confirmText: '确定删除',
      cancelText: '取消',
      type: 'danger',
      onConfirm: () => {
        removeItem(uid)
      }
    })
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h1 className="cart-title">购物车</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-icon-wrapper">
            <div className="cart-empty-icon">🛒</div>
          </div>
          <p className="cart-empty-text">您的购物车暂时没有商品</p>
          <button className="cart-empty-btn" onClick={() => navigate('/')}>
            去购物
          </button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.uid} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <div className="cart-item-header">
                    <h3 className="cart-item-name">{item.name}</h3>
                  </div>
                  {item.selectedSpecs && (
                    <p className="cart-item-specs">
                      {Object.values(item.selectedSpecs)
                        .map((spec) => `${spec.specName}：${spec.label}`)
                        .join(' / ')}
                    </p>
                  )}
                  <div className="cart-item-price">¥{item.price.toLocaleString()}</div>
                </div>
                <div className="cart-item-actions">
                  <button
                    className="cart-item-btn"
                    onClick={() => handleDecrease(item.uid, item.quantity, item.name)}
                  >
                    -
                  </button>
                  <span className="cart-item-quantity">{item.quantity}</span>
                  <button
                    className="cart-item-btn"
                    onClick={() => handleIncrease(item.uid, item.quantity)}
                  >
                    +
                  </button>
                </div>
                <button className="cart-item-remove" onClick={() => handleRemove(item.uid, item.name)}>
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-footer-wrapper">
              <div className="cart-total">
                <span className="cart-total-label">合计：</span>
                <span className="cart-total-price">¥{totalPrice.toFixed(2)}</span>
              </div>
              <button className="cart-checkout-btn" onClick={() => navigate('/checkout')}>
                去结算
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart


