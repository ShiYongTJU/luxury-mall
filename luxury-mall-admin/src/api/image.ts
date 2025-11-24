import axios from 'axios'
import { Image, ImageQueryParams, ImageListResponse } from '../types/image'
import { API_ROUTES } from './index'

export const imageApi = {
  // 获取图片列表（支持查询和分页）
  getImages: async (params?: ImageQueryParams): Promise<ImageListResponse> => {
    try {
      const response = await axios.get(API_ROUTES.images.list, { params })
      return response.data
    } catch (error) {
      console.error('获取图片列表失败:', error)
      throw error
    }
  },

  // 获取图片详情
  getImageById: async (id: string): Promise<Image> => {
    try {
      const response = await axios.get(API_ROUTES.images.detail(id))
      return response.data
    } catch (error) {
      console.error('获取图片详情失败:', error)
      throw error
    }
  },

  // 更新图片
  updateImage: async (id: string, updates: Partial<Image>): Promise<Image> => {
    try {
      const response = await axios.put(API_ROUTES.images.update, {
        id,
        ...updates
      })
      return response.data
    } catch (error) {
      console.error('更新图片失败:', error)
      throw error
    }
  },

  // 新增图片
  addImage: async (image: Omit<Image, 'id'> & { id?: string }): Promise<Image> => {
    try {
      const response = await axios.post(API_ROUTES.images.add, image)
      return response.data
    } catch (error) {
      console.error('新增图片失败:', error)
      throw error
    }
  },

  // 删除图片
  deleteImage: async (id: string): Promise<void> => {
    try {
      await axios.delete(API_ROUTES.images.delete(id))
    } catch (error) {
      console.error('删除图片失败:', error)
      throw error
    }
  }
}

