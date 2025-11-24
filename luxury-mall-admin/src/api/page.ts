import axios from 'axios'
import { API_ROUTES } from './index'
import { Page, PageQueryParams, PageListResponse, CreatePageData, UpdatePageData } from '../types/page'

export const pageApi = {
  // 获取页面列表
  getPages: async (params?: PageQueryParams): Promise<PageListResponse> => {
    try {
      const response = await axios.get(API_ROUTES.pages.list, { params })
      return response.data
    } catch (error) {
      console.error('获取页面列表失败:', error)
      throw error
    }
  },

  // 获取页面详情
  getPageById: async (id: string): Promise<Page> => {
    try {
      const response = await axios.get(API_ROUTES.pages.detail(id))
      return response.data
    } catch (error) {
      console.error(`获取页面 ${id} 失败:`, error)
      throw error
    }
  },

  // 创建页面
  createPage: async (pageData: CreatePageData): Promise<Page> => {
    try {
      const response = await axios.post(API_ROUTES.pages.create, pageData)
      return response.data
    } catch (error) {
      console.error('创建页面失败:', error)
      throw error
    }
  },

  // 更新页面（编辑）
  updatePage: async (id: string, updates: UpdatePageData): Promise<Page> => {
    try {
      const response = await axios.put(API_ROUTES.pages.update(id), updates)
      return response.data
    } catch (error) {
      console.error('更新页面失败:', error)
      throw error
    }
  },

  // 发布页面
  publishPage: async (id: string): Promise<Page> => {
    try {
      const response = await axios.post(API_ROUTES.pages.publish(id))
      return response.data
    } catch (error) {
      console.error('发布页面失败:', error)
      throw error
    }
  },

  // 运营操作
  operatePage: async (id: string): Promise<Page> => {
    try {
      const response = await axios.post(API_ROUTES.pages.operate(id))
      return response.data
    } catch (error) {
      console.error('运营操作失败:', error)
      throw error
    }
  },

  // 删除页面
  deletePage: async (id: string): Promise<void> => {
    try {
      await axios.delete(API_ROUTES.pages.delete(id))
    } catch (error) {
      console.error('删除页面失败:', error)
      throw error
    }
  }
}

