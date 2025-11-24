// API 路由统一管理
// 所有 API 路径都在这里定义，方便统一管理和修改

const API_BASE_URL = (() => {
  // 如果设置了环境变量，使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 开发和生产环境都使用相对路径
  // 开发环境：Vite 代理会将 /api 转发到服务器后端
  // 生产环境：Nginx 代理会将 /api 转发到后端
  return '/api'
})()

export const API_ROUTES = {
  // 商品相关
  products: {
    list: `${API_BASE_URL}/products`,
    detail: (id: string) => `${API_BASE_URL}/products/${id}`,
    update: `${API_BASE_URL}/updateProducts`,
    add: `${API_BASE_URL}/addProducts`,
    categories: `${API_BASE_URL}/products/categories`,
    homepage: `${API_BASE_URL}/products/homepage`
  },
  
  // 搜索相关
  search: {
    search: `${API_BASE_URL}/search`
  },
  
  // 用户相关
  users: {
    login: `${API_BASE_URL}/users/login`,
    register: `${API_BASE_URL}/users/register`,
    profile: `${API_BASE_URL}/users/profile`
  },
  
  // 订单相关
  orders: {
    list: `${API_BASE_URL}/orders`,
    detail: (id: string) => `${API_BASE_URL}/orders/${id}`,
    create: `${API_BASE_URL}/orders`
  },
  
  // 地址相关
  addresses: {
    list: `${API_BASE_URL}/addresses`,
    create: `${API_BASE_URL}/addresses`,
    update: (id: string) => `${API_BASE_URL}/addresses/${id}`,
    delete: (id: string) => `${API_BASE_URL}/addresses/${id}`
  },
  
  // 地区相关
  regions: {
    list: `${API_BASE_URL}/regions`,
    provinces: `${API_BASE_URL}/regions/provinces`,
    cities: (provinceCode: string) => `${API_BASE_URL}/regions/cities/${provinceCode}`,
    districts: (cityCode: string) => `${API_BASE_URL}/regions/districts/${cityCode}`
  },
  
  // 首页相关
  homepage: {
    data: `${API_BASE_URL}/homepage`
  },
  
  // 图片素材相关
  images: {
    list: `${API_BASE_URL}/images`,
    detail: (id: string) => `${API_BASE_URL}/images/${id}`,
    update: `${API_BASE_URL}/updateImages`,
    add: `${API_BASE_URL}/addImages`,
    delete: (id: string) => `${API_BASE_URL}/images/${id}`
  },
  
  // 页面相关
  pages: {
    list: `${API_BASE_URL}/pages`,
    detail: (id: string) => `${API_BASE_URL}/pages/${id}`,
    create: `${API_BASE_URL}/pages`,
    update: (id: string) => `${API_BASE_URL}/pages/${id}`,
    publish: (id: string) => `${API_BASE_URL}/pages/${id}/publish`,
    operate: (id: string) => `${API_BASE_URL}/pages/${id}/operate`,
    delete: (id: string) => `${API_BASE_URL}/pages/${id}`
  }
} as const

