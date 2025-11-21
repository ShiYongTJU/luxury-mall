import axios from 'axios'
import { HomePageData, Product, Category } from '@/types/product'
import { Order, Address } from '@/types/address'
import { User, RegisterData, LoginData, AuthResponse } from '@/types/user'
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api'

// 从localStorage获取token
const getToken = () => {
  return localStorage.getItem('auth_token') || ''
}

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器 - 添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    if (error.response) {
      // 401 未授权，清除token并跳转到登录页
      if (error.response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        // 如果不在登录页面，跳转到登录页
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      }
      // 服务器返回了错误状态码
      throw new Error(error.response.data?.message || error.response.data?.error || '请求失败')
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      throw new Error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败')
    }
  }
)

// 获取首页配置数据
export const getHomePageData = async (): Promise<HomePageData> => {
  const response = await apiClient.get<HomePageData>(API_ENDPOINTS.HOMEPAGE)
  return response
}

// 获取商品列表
export const getProducts = async (category?: string): Promise<Product[]> => {
  const params = category ? { category } : {}
  const response = await apiClient.get<Product[]>(API_ENDPOINTS.PRODUCTS, { params })
  return response
}

// 获取分类列表
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES)
  return response
}

// 获取商品详情
export const getProductDetail = async (id: string): Promise<Product | null> => {
  try {
    const response = await apiClient.get<Product>(API_ENDPOINTS.PRODUCT_DETAIL(id))
    return response
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null
    }
    throw error
  }
}

// 搜索商品（模糊搜索）
export const searchProducts = async (keyword: string): Promise<Product[]> => {
  if (!keyword || keyword.trim() === '') {
    return []
  }
  
  const response = await apiClient.get<Product[]>(API_ENDPOINTS.SEARCH, {
    params: { q: keyword.trim() }
  })
  return response
}

// 创建订单
export const createOrder = async (orderData: Omit<Order, 'id' | 'orderNo' | 'createTime'>): Promise<Order> => {
  const response = await apiClient.post<Order>(API_ENDPOINTS.ORDERS, orderData)
  return response
}

// 获取订单列表
export const getOrders = async (): Promise<Order[]> => {
  const response = await apiClient.get<Order[]>(API_ENDPOINTS.ORDERS)
  return response
}

// 获取订单详情
export const getOrderById = async (id: string): Promise<Order | null> => {
  try {
    const response = await apiClient.get<Order>(API_ENDPOINTS.ORDER_DETAIL(id))
    return response
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null
    }
    throw error
  }
}

// 支付订单
export const payOrder = async (id: string): Promise<Order> => {
  const response = await apiClient.post<Order>(`${API_ENDPOINTS.ORDER_DETAIL(id)}/pay`)
  return response
}

// 取消订单
export const cancelOrder = async (id: string): Promise<Order> => {
  const response = await apiClient.post<Order>(`${API_ENDPOINTS.ORDER_DETAIL(id)}/cancel`)
  return response
}

// ========== 地址相关 API ==========

// 获取所有地址
export const getAddresses = async (): Promise<Address[]> => {
  const response = await apiClient.get<Address[]>(API_ENDPOINTS.ADDRESSES)
  return response
}

// 根据 ID 获取地址
export const getAddressById = async (id: string): Promise<Address | null> => {
  try {
    const response = await apiClient.get<Address>(API_ENDPOINTS.ADDRESS_DETAIL(id))
    return response
  } catch (error: any) {
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      return null
    }
    throw error
  }
}

// 创建地址
export const createAddress = async (addressData: Omit<Address, 'id'>): Promise<Address> => {
  const response = await apiClient.post<Address>(API_ENDPOINTS.ADDRESSES, addressData)
  return response
}

// 更新地址
export const updateAddress = async (id: string, updates: Partial<Address>): Promise<Address> => {
  const response = await apiClient.put<Address>(API_ENDPOINTS.ADDRESS_DETAIL(id), updates)
  return response
}

// 删除地址
export const deleteAddress = async (id: string): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.ADDRESS_DETAIL(id))
}

// 设置默认地址
export const setDefaultAddress = async (id: string): Promise<Address> => {
  const response = await apiClient.patch<Address>(API_ENDPOINTS.SET_DEFAULT_ADDRESS(id))
  return response
}

// ========== 地区相关 API ==========

export interface Region {
  code: string
  name: string
}

// 获取所有省份
export const getProvinces = async (): Promise<Region[]> => {
  const response = await apiClient.get<Region[]>(API_ENDPOINTS.PROVINCES)
  return response
}

// 根据省份代码获取城市列表
export const getCities = async (provinceCode: string): Promise<Region[]> => {
  const response = await apiClient.get<Region[]>(API_ENDPOINTS.CITIES(provinceCode))
  return response
}

// 根据省份和城市代码获取区县列表
export const getDistricts = async (provinceCode: string, cityCode: string): Promise<Region[]> => {
  const response = await apiClient.get<Region[]>(API_ENDPOINTS.DISTRICTS(provinceCode, cityCode))
  return response
}

// ========== 用户相关 API ==========

// 注册
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, data)
  return response
}

// 登录
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, data)
  return response
}

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(API_ENDPOINTS.GET_CURRENT_USER)
  return response
}

