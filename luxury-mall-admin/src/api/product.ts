import axios from 'axios'
import { Product, ProductQueryParams } from '../types/product'

// 根据环境变量获取 API 基础 URL
// 开发环境：使用服务器地址（从 .env.development 读取，或直接配置）
// 生产环境：使用相对路径（通过 nginx 代理）
const getApiBaseUrl = () => {
  // 如果设置了环境变量，使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  
  // 开发环境：直接使用服务器地址（请根据实际情况修改）
  if (import.meta.env.DEV) {
    return 'http://1.15.93.186:3001/api'
  }
  
  // 生产环境：使用相对路径
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

export const productApi = {
  // 获取商品列表（支持查询参数和分页）
  getProducts: async (params?: ProductQueryParams): Promise<ProductListResponse> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, { params })
      
      // 如果返回的是数组（旧接口格式），转换为新格式
      if (Array.isArray(response.data)) {
        return {
          products: response.data,
          total: response.data.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10
        }
      }
      
      // 如果返回的是对象（新接口格式）
      if (response.data.products && Array.isArray(response.data.products)) {
        return {
          products: response.data.products,
          total: response.data.total || response.data.products.length,
          page: response.data.page || params?.page || 1,
          pageSize: response.data.pageSize || params?.pageSize || 10
        }
      }
      
      // 兼容其他格式
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          products: response.data.data,
          total: response.data.total || response.data.data.length,
          page: response.data.page || params?.page || 1,
          pageSize: response.data.pageSize || params?.pageSize || 10
        }
      }
      
      return {
        products: [],
        total: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
      throw error
    }
  },

  // 获取商品详情
  getProductById: async (id: string): Promise<Product> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${id}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('获取商品详情失败:', error)
      throw error
    }
  }
}

