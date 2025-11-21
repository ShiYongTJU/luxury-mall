import { useState, useEffect } from 'react'
import { useAddress } from '@/context/AddressContext'
import { getProvinces, getCities, getDistricts, type Region } from '@/api/api'
import type { Address } from '@/types/address'
import { toast } from '@/components/basic/Toast/Toast'
import { confirm } from '@/components/basic/Confirm/Confirm'
import './Settings.css'

interface AddressManagementProps {
  onBack: () => void
}

// 表单验证规则
const validateForm = (formData: any): { isValid: boolean; error: string } => {
  if (!formData.name || !/^[\u4e00-\u9fa5a-zA-Z0-9]{2,20}$/.test(formData.name)) {
    return { isValid: false, error: '请输入2-20个字符的收货人姓名（支持中文、英文、数字）' }
  }
  if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) {
    return { isValid: false, error: '请输入正确的11位手机号码' }
  }
  if (!formData.province || !formData.city || !formData.district) {
    return { isValid: false, error: '请选择完整的省市区信息' }
  }
  if (!formData.detail || formData.detail.trim().length < 5 || formData.detail.trim().length > 100) {
    return { isValid: false, error: '请输入5-100个字符的详细地址' }
  }
  if (formData.tag && formData.tag.trim().length > 10) {
    return { isValid: false, error: '地址标签不能超过10个字符' }
  }
  return { isValid: true, error: '' }
}

const AddressManagement = ({ onBack }: AddressManagementProps) => {
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress()
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  
  // 地区数据
  const [provinces, setProvinces] = useState<Region[]>([])
  const [cities, setCities] = useState<Region[]>([])
  const [districts, setDistricts] = useState<Region[]>([])
  
  // 选中的地区代码
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string>('')
  const [selectedCityCode, setSelectedCityCode] = useState<string>('')
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string>('')
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false,
    tag: ''
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

  // 初始化地址数据
  useEffect(() => {
    if (editingAddress && provinces.length > 0) {
      setFormData({
        name: editingAddress.name,
        phone: editingAddress.phone,
        province: editingAddress.province,
        city: editingAddress.city,
        district: editingAddress.district,
        detail: editingAddress.detail,
        isDefault: editingAddress.isDefault,
        tag: editingAddress.tag || ''
      })
      
      const matchedProvince = provinces.find(p => p.name === editingAddress.province)
      if (matchedProvince) {
        setSelectedProvinceCode(matchedProvince.code)
      }
    } else if (editingAddress) {
      setFormData({
        name: editingAddress.name,
        phone: editingAddress.phone,
        province: editingAddress.province,
        city: editingAddress.city,
        district: editingAddress.district,
        detail: editingAddress.detail,
        isDefault: editingAddress.isDefault,
        tag: editingAddress.tag || ''
      })
    }
  }, [editingAddress, provinces])

  // 当城市列表加载后，尝试匹配城市代码
  useEffect(() => {
    if (editingAddress && cities.length > 0 && selectedProvinceCode && !selectedCityCode) {
      const matchedCity = cities.find(c => c.name === editingAddress.city)
      if (matchedCity) {
        setSelectedCityCode(matchedCity.code)
      }
    }
  }, [editingAddress, cities, selectedProvinceCode, selectedCityCode])

  // 当区县列表加载后，尝试匹配区县代码
  useEffect(() => {
    if (editingAddress && districts.length > 0 && selectedCityCode && !selectedDistrictCode) {
      const matchedDistrict = districts.find(d => d.name === editingAddress.district)
      if (matchedDistrict) {
        setSelectedDistrictCode(matchedDistrict.code)
      }
    }
  }, [editingAddress, districts, selectedCityCode, selectedDistrictCode])

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedProvinceCode(code)
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedCityCode(code)
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value
    setSelectedDistrictCode(code)
    
    const selectedDistrict = districts.find(d => d.code === code)
    setFormData(prev => ({
      ...prev,
      district: selectedDistrict?.name || ''
    }))
  }

  const handleAddNew = () => {
    setEditingAddress(null)
    setFormData({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
      tag: ''
    })
    setSelectedProvinceCode('')
    setSelectedCityCode('')
    setSelectedDistrictCode('')
    setShowForm(true)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleDelete = (address: Address) => {
    confirm.show({
      title: '删除地址',
      message: '确定要删除这个收货地址吗？',
      confirmText: '确定删除',
      cancelText: '取消',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteAddress(address.id)
        } catch (error) {
          // 错误已在 AddressContext 中处理
        }
      }
    })
  }

  const handleSetDefault = async (address: Address) => {
    try {
      await setDefaultAddress(address.id)
    } catch (error) {
      // 错误已在 AddressContext 中处理
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validateForm(formData)
    if (!validation.isValid) {
      toast.warning(validation.error)
      return
    }

    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData)
      } else {
        await addAddress(formData)
      }
      setShowForm(false)
      setEditingAddress(null)
    } catch (error) {
      // 错误已在 AddressContext 中处理
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingAddress(null)
    setFormData({
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false,
      tag: ''
    })
    setSelectedProvinceCode('')
    setSelectedCityCode('')
    setSelectedDistrictCode('')
  }

  if (showForm) {
    return (
      <div className="settings">
        <div className="settings-header">
          <button className="settings-back-btn" onClick={handleCancel}>
            ‹
          </button>
          <h2 className="settings-title">{editingAddress ? '编辑地址' : '新增地址'}</h2>
        </div>

        <div className="settings-content">
          <form className="address-form" onSubmit={handleSubmit}>
            <div className="address-form-group">
              <label>收货人 <span className="address-form-required">*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入2-20个字符的收货人姓名"
                required
                maxLength={20}
              />
            </div>

            <div className="address-form-group">
              <label>手机号 <span className="address-form-required">*</span></label>
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

            <div className="address-form-group">
              <label>所在地区 <span className="address-form-required">*</span></label>
              <div className="address-form-row">
                <select
                  value={selectedProvinceCode}
                  onChange={handleProvinceChange}
                  className="address-form-select"
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
                  className="address-form-select"
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
                  className="address-form-select"
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

            <div className="address-form-group">
              <label>详细地址 <span className="address-form-required">*</span></label>
              <input
                type="text"
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="请输入街道、门牌号等详细地址（5-100个字符）"
                required
                maxLength={100}
              />
            </div>

            <div className="address-form-group">
              <label>地址标签</label>
              <input
                type="text"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="家、公司、学校等（可选）"
                maxLength={10}
              />
            </div>

            <div className="address-form-group">
              <label className="address-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
                设为默认地址
              </label>
            </div>

            <div className="address-form-actions">
              <button type="button" className="address-form-cancel-btn" onClick={handleCancel}>
                取消
              </button>
              <button type="submit" className="address-form-submit-btn">
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <button className="settings-back-btn" onClick={onBack}>
          ‹
        </button>
        <h2 className="settings-title">收货地址管理</h2>
        <button className="settings-add-btn" onClick={handleAddNew}>
          + 新增
        </button>
      </div>

      <div className="settings-content">
        {addresses.length === 0 ? (
          <div className="address-empty">
            <div className="address-empty-icon">📍</div>
            <p className="address-empty-text">暂无收货地址</p>
            <button className="address-empty-btn" onClick={handleAddNew}>
              添加地址
            </button>
          </div>
        ) : (
          <div className="address-list">
            {addresses.map(address => (
              <div key={address.id} className="address-item">
                <div className="address-item-header">
                  <div className="address-item-info">
                    <span className="address-item-name">{address.name}</span>
                    <span className="address-item-phone">{address.phone}</span>
                    {address.isDefault && <span className="address-item-default">默认</span>}
                    {address.tag && <span className="address-item-tag">{address.tag}</span>}
                  </div>
                </div>
                <div className="address-item-detail">
                  {address.province} {address.city} {address.district} {address.detail}
                </div>
                <div className="address-item-actions">
                  {!address.isDefault && (
                    <button
                      className="address-action-btn"
                      onClick={() => handleSetDefault(address)}
                    >
                      设为默认
                    </button>
                  )}
                  <button
                    className="address-action-btn"
                    onClick={() => handleEdit(address)}
                  >
                    编辑
                  </button>
                  <button
                    className="address-action-btn address-action-btn-danger"
                    onClick={() => handleDelete(address)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddressManagement


