import {
  DataSourceItem,
  DataSourceQueryParams,
  DataSourceListResponse,
  CreateDataSourceData,
  UpdateDataSourceData,
  DataSourceType
} from '../types/datasource'
import {
  queryDataSourceItems,
  getDataSourceItemById,
  createDataSourceItem,
  updateDataSourceItem,
  deleteDataSourceItem
} from '../database/pg-db'

export class DataSourceService {
  // 查询数据源列表
  static async queryItems(
    type: DataSourceType,
    params: DataSourceQueryParams = {}
  ): Promise<DataSourceListResponse> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (process.env.USE_DATABASE === 'true') {
      return await queryDataSourceItems(type, params)
    }
    
    throw new Error('JSON file query not implemented, please use database')
  }

  // 根据ID获取数据源项
  static async getItemById(
    type: DataSourceType,
    id: string
  ): Promise<DataSourceItem | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (process.env.USE_DATABASE === 'true') {
      return await getDataSourceItemById(type, id)
    }
    
    throw new Error('JSON file query not implemented, please use database')
  }

  // 创建数据源项
  static async createItem(
    type: DataSourceType,
    itemData: CreateDataSourceData
  ): Promise<DataSourceItem> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (process.env.USE_DATABASE === 'true') {
      return await createDataSourceItem(type, itemData)
    }
    
    throw new Error('JSON file create not implemented, please use database')
  }

  // 更新数据源项
  static async updateItem(
    type: DataSourceType,
    id: string,
    updates: UpdateDataSourceData
  ): Promise<DataSourceItem | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (process.env.USE_DATABASE === 'true') {
      return await updateDataSourceItem(type, id, updates)
    }
    
    throw new Error('JSON file update not implemented, please use database')
  }

  // 删除数据源项
  static async deleteItem(
    type: DataSourceType,
    id: string
  ): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (process.env.USE_DATABASE === 'true') {
      return await deleteDataSourceItem(type, id)
    }
    
    throw new Error('JSON file delete not implemented, please use database')
  }
}

