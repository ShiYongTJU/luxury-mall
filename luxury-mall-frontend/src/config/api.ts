// API 配置
// 生产环境：如果使用 Nginx 反向代理，使用相对路径
// 开发环境：使用完整 URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '' : 'http://localhost:3001')

export const API_ENDPOINTS = {
  // 商品相关
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
  CATEGORIES: '/api/products/categories',
  HOMEPAGE: '/api/products/homepage',
  
  // 搜索
  SEARCH: '/api/search',
  
  // 订单相关
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id: string) => `/api/orders/${id}`,
  
  // 地址相关
  ADDRESSES: '/api/addresses',
  ADDRESS_DETAIL: (id: string) => `/api/addresses/${id}`,
  SET_DEFAULT_ADDRESS: (id: string) => `/api/addresses/${id}/default`,
  
  // 地区相关
  PROVINCES: '/api/regions/provinces',
  CITIES: (provinceCode: string) => `/api/regions/provinces/${provinceCode}/cities`,
  DISTRICTS: (provinceCode: string, cityCode: string) => `/api/regions/provinces/${provinceCode}/cities/${cityCode}/districts`,
  
  // 用户相关
  REGISTER: '/api/users/register',
  LOGIN: '/api/users/login',
  GET_CURRENT_USER: '/api/users/me',
  
  // 健康检查
  HEALTH: '/health'
} as const


