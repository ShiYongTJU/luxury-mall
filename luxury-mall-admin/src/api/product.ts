import axios from 'axios'
import { Product, ProductQueryParams } from '../types/product'

const API_BASE_URL = '/api'

export const productApi = {
  // 获取商品列表
  getProducts: async (params?: ProductQueryParams): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, { params })
      // 后端可能返回数组或对象，需要处理不同的响应格式
      if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else if (response.data.products && Array.isArray(response.data.products)) {
        return response.data.products
      }
      return []
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

