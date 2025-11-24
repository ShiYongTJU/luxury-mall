import axios from 'axios'
import { Product, ProductQueryParams } from '../types/product'
import { API_ROUTES } from './index'

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
      const response = await axios.get(API_ROUTES.products.list, { params })
      
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
      const response = await axios.get(API_ROUTES.products.detail(id))
      return response.data.data || response.data
    } catch (error) {
      console.error('获取商品详情失败:', error)
      throw error
    }
  },

  // 更新商品
  updateProduct: async (id: string, updates: Partial<Product>): Promise<Product> => {
    try {
      const response = await axios.put(API_ROUTES.products.update, {
        id,
        ...updates
      })
      return response.data
    } catch (error) {
      console.error('更新商品失败:', error)
      throw error
    }
  }
}

