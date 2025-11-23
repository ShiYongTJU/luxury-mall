import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { useAddress } from '@/context/AddressContext'
import { useUser } from '@/context/UserContext'
import type { Address } from '@/types/address'
import { toast } from '@/components/basic/Toast/Toast'
import { createOrder } from '@/api/api'
import { getProvinces, getCities, getDistricts, type Region } from '@/data/regions'
import './Checkout.css'

const Checkout = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading: userLoading } = useUser()
  const { items: cartItems } = useCart()
  const { addresses, defaultAddress, setDefaultAddress, refreshAddresses } = useAddress()
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const hasCheckedAuth = useRef(false) // 防止重复检查登录状态

  // 登录状态检查（只执行一次）
  useEffect(() => {
    if (userLoading) return
    
    if (!isAuthenticated && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      toast.warning('请先登录')
      navigate('/login', { state: { from: '/checkout' } })
      return
    }
  }, [isAuthenticated, userLoading, navigate])

  // 购物车检查
  useEffect(() => {
    if (userLoading || !isAuthenticated) return

    if (cartItems.length === 0) {
      toast.warning('购物车为空，无法结算')
      navigate('/cart')
      return
    }
  }, [cartItems, navigate, isAuthenticated, userLoading])

  // 地址选择逻辑（在已登录后执行）
  useEffect(() => {
    if (userLoading || !isAuthenticated) return

    // 设置默认地址或第一个地址
    if (addresses.length > 0) {
      // 如果当前没有选中地址，或者选中的地址不在列表中，则重新选择
      if (!selectedAddress || !addresses.find(addr => addr.id === selectedAddress.id)) {
        if (defaultAddress) {
          setSelectedAddress(defaultAddress)
        } else {
          // 如果没有默认地址，选择第一个地址
          setSelectedAddress(addresses[0])
        }
      }
    } else {
      // 如果没有地址，清空选择
      setSelectedAddress(null)
    }
  }, [addresses, defaultAddress, isAuthenticated, userLoading, selectedAddress])

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
    setShowAddressForm(false)
  }

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id)
      // toast 已在 AddressContext 中显示
    } catch (error) {
      // 错误已在 AddressContext 中处理
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitOrder = async () => {
    if (!selectedAddress) {
      toast.warning('请选择收货地址')
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // 确保地址对象完整（移除 userId，因为后端会自动添加）
      const { userId, ...addressWithoutUserId } = selectedAddress
      
      // 准备订单数据（不包含id、orderNo、createTime、userId，这些由后端生成）
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          selectedSpecs: item.selectedSpecs
        })),
        address: addressWithoutUserId,
        totalPrice,
        status: 'pending' as const
      }

      // 调用后端API创建订单
      const order = await createOrder(orderData)

      toast.success('订单提交成功')
      navigate('/order-success', { state: { orderNo: order.orderNo } })
    } catch (error: any) {
      console.error('创建订单失败:', error)
      toast.error(error.message || '订单提交失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="checkout">
      <div className="checkout-header">
        <h1 className="checkout-title">确认订单</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-section">
          <div className="checkout-section-header">
            <h3>收货地址</h3>
            <button
              className="checkout-add-address-btn"
              onClick={() => {
                setEditingAddress(null)
                setShowAddressForm(true)
              }}
            >
              + 新增地址
            </button>
          </div>

          {showAddressForm ? (
            <AddressForm
              address={editingAddress}
              onSave={async () => {
                setShowAddressForm(false)
                setEditingAddress(null)
                // 重新获取地址列表
                await refreshAddresses()
                // 选择默认地址或第一个地址
                // 使用 useEffect 来响应 addresses 的变化，而不是在这里直接设置
              }}
              onCancel={() => {
                setShowAddressForm(false)
                setEditingAddress(null)
              }}
            />
          ) : (
            <div className="checkout-address-list">
              {addresses.length === 0 ? (
                <div className="checkout-empty-address">
                  <p>暂无收货地址，请添加</p>
                  <button
                    className="checkout-add-address-btn"
                    onClick={() => {
                      setEditingAddress(null)
                      setShowAddressForm(true)
                    }}
                  >
                    + 添加地址
                  </button>
                </div>
              ) : (
                addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`checkout-address-item ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="checkout-address-info">
                      <div className="checkout-address-header">
                        <span className="checkout-address-name">{address.name}</span>
                        <span className="checkout-address-phone">{address.phone}</span>
                        {address.isDefault && <span className="checkout-address-default">默认</span>}
                        {address.tag && <span className="checkout-address-tag">{address.tag}</span>}
                      </div>
                      <div className="checkout-address-detail">
                        {address.province} {address.city} {address.district} {address.detail}
                      </div>
                    </div>
                    <div className="checkout-address-actions">
                      {!address.isDefault && (
                        <button
                          className="checkout-address-action-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetDefault(address)
                          }}
                        >
                          设为默认
                        </button>
                      )}
                      <button
                        className="checkout-address-action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingAddress(address)
                          setShowAddressForm(true)
                        }}
                      >
                        编辑
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="checkout-section">
          <h3>商品信息</h3>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.uid} className="checkout-item">
                <img src={item.image} alt={item.name} className="checkout-item-image" />
                <div className="checkout-item-info">
                  <h4 className="checkout-item-name">{item.name}</h4>
                  {item.selectedSpecs && (
                    <p className="checkout-item-specs">
                      {Object.values(item.selectedSpecs)
                        .map((spec) => `${spec.specName}：${spec.label}`)
                        .join(' / ')}
                    </p>
                  )}
                </div>
                <div className="checkout-item-right">
                  <div className="checkout-item-price">¥{item.price.toLocaleString()}</div>
                  <div className="checkout-item-quantity">x{item.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <div className="checkout-summary">
            <div className="checkout-summary-row">
              <span>商品合计</span>
              <span>¥{totalPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>运费</span>
              <span>免运费</span>
            </div>
            <div className="checkout-summary-total">
              <span>实付金额</span>
              <span className="checkout-total-price">¥{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-footer">
        <div className="checkout-footer-wrapper">
          <div className="checkout-footer-total">
            <span className="checkout-footer-label">合计：</span>
            <span className="checkout-footer-price">¥{totalPrice.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-submit-btn" 
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? '提交中...' : '提交订单'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AddressFormProps {
  address?: Address | null
  onSave: () => void
  onCancel: () => void
}

// 表单验证规则
const validateForm = (formData: any): { isValid: boolean; error: string } => {
  // 姓名验证：2-20个字符，支持中文、英文、数字
  if (!formData.name || !/^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/.test(formData.name)) {
    return { isValid: false, error: '请输入2-20个字符的收货人姓名（支持中文、英文、数字）' }
  }

  // 手机号验证：11位数字，1开头
  if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
    return { isValid: false, error: '请输入正确的11位手机号码' }
  }

  // 省市区验证
  if (!formData.province || !formData.city || !formData.district) {
    return { isValid: false, error: '请选择完整的省市区信息' }
  }

  // 详细地址验证：5-100个字符
  if (!formData.detail || formData.detail.trim().length < 5 || formData.detail.trim().length > 100) {
    return { isValid: false, error: '请输入5-100个字符的详细地址' }
  }

  // 地址标签验证（可选）：1-10个字符
  if (formData.tag && formData.tag.trim().length > 10) {
    return { isValid: false, error: '地址标签不能超过10个字符' }
  }

  return { isValid: true, error: '' }
}

const AddressForm = ({ address, onSave, onCancel }: AddressFormProps) => {
  const { updateAddress, addAddress } = useAddress()
  
  // 地区数据
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  
  // 选中的地区代码
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('')
  const [selectedCityCode, setSelectedCityCode] = useState<string>('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: address?.name || '',
    phone: address?.phone || '',
    province: address?.province || '',
    city: address?.city || '',
    district: address?.district || '',
    detail: address?.detail || '',
    isDefault: address?.isDefault || false,
    tag: address?.tag || ''
  })

  // 加载省份列表
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await getProvinces()
        setProvinces(data)
      } catch (error) {
        console.error('加载省份列表失败:', error)
        toast.error('加载省份列表失败')
      }
    }
    loadProvinces()
  }, [])

  // 根据省份加载城市列表
  useEffect(() => {
    if (!selectedProvinceCode) {
      setCities([])
      setDistricts([])
      setSelectedCityCode('')
      setSelectedDistrictCode('')
      return
    }

    const loadCities = async () => {
      try {
        const data = await getCities(selectedProvinceCode)
        setCities(data)
        setDistricts([])
        setSelectedCityCode('')
        setSelectedDistrictCode('')
        
        // 更新表单数据
        const selectedProvince = provinces.find(p => p.code === selectedProvinceCode)
        setFormData(prev => ({
          ...prev,
          province: selectedProvince?.name || '',
          city: '',
          district: ''
        }))
      } catch (error) {
        console.error('加载城市列表失败:', error)
        toast.error('加载城市列表失败')
      }
    }
    loadCities()
  }, [selectedProvinceCode, provinces])

  // 根据城市加载区县列表
  useEffect(() => {
    if (!selectedCityCode || !selectedProvinceCode) {
      setDistricts([])
      setSelectedDistrictCode('')
      return
    }

    const loadDistricts = async () => {
      try {
        const data = await getDistricts(selectedProvinceCode, selectedCityCode)
        setDistricts(data)
        setSelectedDistrictCode('')
        
        // 更新表单数据
        const selectedCity = cities.find(c => c.code === selectedCityCode)
        setFormData(prev => ({
          ...prev,
          city: selectedCity?.name || '',
          district: ''
        }))
      } catch (error) {
        console.error('加载区县列表失败:', error)
        toast.error('加载区县列表失败')
      }
    }
    loadDistricts()
  }, [selectedCityCode, selectedProvinceCode, cities])

  // 初始化地址数据 - 当有地址且省份列表已加载时
  useEffect(() => {
    if (address && provinces.length > 0) {
      setFormData({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.isDefault,
        tag: address.tag || ''
      })
      
      // 尝试根据地址名称找到对应的省份代码
      const matchedProvince = provinces.find(p => p.name === address.province)
      if (matchedProvince) {
        setSelectedProvinceCode(matchedProvince.code)
      }
    } else if (address) {
      // 如果地址存在但省份列表未加载，先设置表单数据
      setFormData({
        name: address.name,
        phone: address.phone,
        province: address.province,
        city: address.city,
        district: address.district,
        detail: address.detail,
        isDefault: address.isDefault,
        tag: address.tag || ''
      })
    }
  }, [address, provinces])

  // 当城市列表加载后，尝试匹配城市代码
  useEffect(() => {
    if (address && cities.length > 0 && selectedProvinceCode && !selectedCityCode) {
      const matchedCity = cities.find(c => c.name === address.city)
      if (matchedCity) {
        setSelectedCityCode(matchedCity.code)
      }
    }
  }, [address, cities, selectedProvinceCode, selectedCityCode])

  // 当区县列表加载后，尝试匹配区县代码
  useEffect(() => {
    if (address && districts.length > 0 && selectedCityCode && !selectedDistrictCode) {
      const matchedDistrict = districts.find(d => d.name === address.district)
      if (matchedDistrict) {
        setSelectedDistrictCode(matchedDistrict.code)
      }
    }
  }, [address, districts, selectedCityCode, selectedDistrictCode])

  // 处理省份选择
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedProvinceCode(code)
  }

  // 处理城市选择
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedCityCode(code)
  }

  // 处理区县选择
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedDistrictCode(code)
    
    const selectedDistrict = districts.find(d => d.code === code)
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict?.name || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    const validation = validateForm(formData)
    if (!validation.isValid) {
      toast.warning(validation.error)
      return
    }

    try {
      if (address) {
        await updateAddress(address.id, formData)
        // toast 已在 AddressContext 中显示
      } else {
        await addAddress(formData)
        // toast 已在 AddressContext 中显示
      }
      onSave()
    } catch (error) {
      // 错误已在 AddressContext 中处理
    }
  }

  return (
    <form className="checkout-address-form" onSubmit={handleSubmit}>
      <div className="checkout-form-group">
        <label>收货人 <span className="checkout-form-required">*</span></label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="请输入2-20个字符的收货人姓名"
          required
          maxLength={20}
        />
      </div>
      <div className="checkout-form-group">
        <label>手机号 <span className="checkout-form-required">*</span></label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '')
            if (value.length <= 11) {
              setFormData({ ...formData, phone: value })
            }
          }}
          placeholder="请输入11位手机号码"
          required
          maxLength={11}
        />
      </div>
      <div className="checkout-form-group">
        <label>所在地区 <span className="checkout-form-required">*</span></label>
        <div className="checkout-form-row">
          <select
            value={selectedProvinceCode}
            onChange={handleProvinceChange}
            className="checkout-form-select"
            required
          >
            <option value="">请选择省份</option>
            {provinces.map(province => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          <select
            value={selectedCityCode}
            onChange={handleCityChange}
            className="checkout-form-select"
            required
            disabled={!selectedProvinceCode}
          >
            <option value="">请选择城市</option>
            {cities.map(city => (
              <option key={city.code} value={city.code}>
                {city.name}
              </option>
            ))}
          </select>
          <select
            value={selectedDistrictCode}
            onChange={handleDistrictChange}
            className="checkout-form-select"
            required
            disabled={!selectedCityCode}
          >
            <option value="">请选择区县</option>
            {districts.map(district => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="checkout-form-group">
        <label>详细地址 <span className="checkout-form-required">*</span></label>
        <input
          type="text"
          value={formData.detail}
          onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
          placeholder="请输入街道、门牌号等详细地址（5-100个字符）"
          required
          maxLength={100}
        />
      </div>
      <div className="checkout-form-group">
        <label>地址标签</label>
        <input
          type="text"
          value={formData.tag}
          onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
          placeholder="家、公司、学校等（可选）"
        />
      </div>
      <div className="checkout-form-group">
        <label className="checkout-checkbox-label">
          <input
            type="checkbox"
            checked={formData.isDefault}
            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          />
          设为默认地址
        </label>
      </div>
      <div className="checkout-form-actions">
        <button type="button" className="checkout-form-cancel-btn" onClick={onCancel}>
          取消
        </button>
        <button type="submit" className="checkout-form-submit-btn">
          保存
        </button>
      </div>
    </form>
  )
}

export default Checkout

