import axios from 'axios'
import { API_ROUTES } from './index'
import {
  DataSourceItem,
  DataSourceQueryParams,
  DataSourceListResponse,
  CreateDataSourceData,
  UpdateDataSourceData,
  DataSourceType
} from '../types/datasource'

export const datasourceApi = {
  // 获取数据源列表
  getItems: async (
    type: DataSourceType,
    params?: DataSourceQueryParams
  ): Promise<DataSourceListResponse> => {
    try {
      const response = await axios.get(API_ROUTES.datasource.list(type), { params })
      return response.data
    } catch (error) {
      console.error(`获取${type}列表失败:`, error)
      throw error
    }
  },

  // 获取数据源详情
  getItemById: async (type: DataSourceType, id: string): Promise<DataSourceItem> => {
    try {
      const response = await axios.get(API_ROUTES.datasource.detail(type, id))
      return response.data
    } catch (error) {
      console.error(`获取${type} ${id}失败:`, error)
      throw error
    }
  },

  // 创建数据源项
  createItem: async (
    type: DataSourceType,
    itemData: CreateDataSourceData
  ): Promise<DataSourceItem> => {
    try {
      const response = await axios.post(API_ROUTES.datasource.create(type), itemData)
      return response.data
    } catch (error) {
      console.error(`创建${type}失败:`, error)
      throw error
    }
  },

  // 更新数据源项
  updateItem: async (
    type: DataSourceType,
    id: string,
    updates: UpdateDataSourceData
  ): Promise<DataSourceItem> => {
    try {
      const response = await axios.put(API_ROUTES.datasource.update(type, id), updates)
      return response.data
    } catch (error) {
      console.error(`更新${type}失败:`, error)
      throw error
    }
  },

  // 删除数据源项
  deleteItem: async (type: DataSourceType, id: string): Promise<void> => {
    try {
      await axios.delete(API_ROUTES.datasource.delete(type, id))
    } catch (error) {
      console.error(`删除${type}失败:`, error)
      throw error
    }
  }
}

