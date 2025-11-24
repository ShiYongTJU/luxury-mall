import { Request, Response, NextFunction } from 'express'
import { DataSourceService } from '../services/datasource.service'
import { CreateDataSourceData, UpdateDataSourceData, DataSourceType } from '../types/datasource'

interface AppError extends Error {
  statusCode?: number
}

// 获取数据源类型
function getDataSourceType(req: Request): DataSourceType {
  const type = req.params.type as DataSourceType
  const validTypes: DataSourceType[] = ['carousel', 'seckill', 'groupbuy', 'productList', 'guessYouLike']
  
  if (!validTypes.includes(type)) {
    const error: AppError = new Error(`Invalid data source type: ${type}`)
    error.statusCode = 400
    throw error
  }
  
  return type
}

// 获取数据源列表
export const getDataSourceItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = getDataSourceType(req)
    const {
      name,
      isEnabled,
      page = '1',
      pageSize = '10'
    } = req.query
    
    const params = {
      name: name as string | undefined,
      isEnabled: isEnabled === 'true' ? true : isEnabled === 'false' ? false : undefined,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10)
    }
    
    const result = await DataSourceService.queryItems(type, params)
    res.json(result)
  } catch (error) {
    console.error('Get data source items error:', error)
    next(error)
  }
}

// 根据ID获取数据源项
export const getDataSourceItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = getDataSourceType(req)
    const { id } = req.params
    const item = await DataSourceService.getItemById(type, id)
    
    if (!item) {
      const error: AppError = new Error('Data source item not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(item)
  } catch (error) {
    console.error('Get data source item by id error:', error)
    next(error)
  }
}

// 创建数据源项
export const createDataSourceItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = getDataSourceType(req)
    const itemData = req.body as CreateDataSourceData
    
    // 验证必填字段
    if (!itemData.name) {
      const error: AppError = new Error('Name is required')
      error.statusCode = 400
      throw error
    }
    
    if (!itemData.data) {
      const error: AppError = new Error('Data is required')
      error.statusCode = 400
      throw error
    }
    
    const item = await DataSourceService.createItem(type, itemData)
    res.status(201).json(item)
  } catch (error) {
    console.error('Create data source item error:', error)
    next(error)
  }
}

// 更新数据源项
export const updateDataSourceItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = getDataSourceType(req)
    const { id } = req.params
    const updates = req.body as UpdateDataSourceData
    
    if (!id) {
      const error: AppError = new Error('Item ID is required')
      error.statusCode = 400
      throw error
    }
    
    const item = await DataSourceService.updateItem(type, id, updates)
    
    if (!item) {
      const error: AppError = new Error('Data source item not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(item)
  } catch (error) {
    console.error('Update data source item error:', error)
    next(error)
  }
}

// 删除数据源项
export const deleteDataSourceItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const type = getDataSourceType(req)
    const { id } = req.params
    
    if (!id) {
      const error: AppError = new Error('Item ID is required')
      error.statusCode = 400
      throw error
    }
    
    const deleted = await DataSourceService.deleteItem(type, id)
    
    if (!deleted) {
      const error: AppError = new Error('Data source item not found')
      error.statusCode = 404
      throw error
    }
    
    res.json({ success: true, message: 'Data source item deleted successfully' })
  } catch (error) {
    console.error('Delete data source item error:', error)
    next(error)
  }
}

