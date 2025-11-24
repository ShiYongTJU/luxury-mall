import { Request, Response, NextFunction } from 'express'
import { PageService } from '../services/page.service'
import { CreatePageData, UpdatePageData } from '../types/page'

interface AppError extends Error {
  statusCode?: number
}

// 获取页面列表
export const getPages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      pageType,
      isPublished,
      page = '1',
      pageSize = '10'
    } = req.query
    
    const params = {
      pageType: pageType as 'homepage' | 'category' | undefined,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10)
    }
    
    const result = await PageService.queryPages(params)
    res.json(result)
  } catch (error) {
    console.error('Get pages error:', error)
    next(error)
  }
}

// 根据ID获取页面
export const getPageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const page = await PageService.getPageById(id)
    
    if (!page) {
      const error: AppError = new Error('Page not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(page)
  } catch (error) {
    console.error('Get page by id error:', error)
    next(error)
  }
}

// 创建页面
export const createPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pageData = req.body as CreatePageData
    
    // 验证必填字段
    if (!pageData.name) {
      const error: AppError = new Error('Page name is required')
      error.statusCode = 400
      throw error
    }
    
    if (!pageData.pageType) {
      const error: AppError = new Error('Page type is required')
      error.statusCode = 400
      throw error
    }
    
    if (pageData.pageType !== 'homepage' && pageData.pageType !== 'category') {
      const error: AppError = new Error('Page type must be "homepage" or "category"')
      error.statusCode = 400
      throw error
    }
    
    const page = await PageService.createPage(pageData)
    res.status(201).json(page)
  } catch (error) {
    console.error('Create page error:', error)
    next(error)
  }
}

// 更新页面（编辑操作）
export const updatePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const updates = req.body as UpdatePageData
    
    if (!id) {
      const error: AppError = new Error('Page ID is required')
      error.statusCode = 400
      throw error
    }
    
    if (updates.pageType && updates.pageType !== 'homepage' && updates.pageType !== 'category') {
      const error: AppError = new Error('Page type must be "homepage" or "category"')
      error.statusCode = 400
      throw error
    }
    
    const page = await PageService.updatePage(id, updates)
    
    if (!page) {
      const error: AppError = new Error('Page not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(page)
  } catch (error) {
    console.error('Update page error:', error)
    next(error)
  }
}

// 发布页面
export const publishPage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    if (!id) {
      const error: AppError = new Error('Page ID is required')
      error.statusCode = 400
      throw error
    }
    
    const page = await PageService.publishPage(id)
    
    if (!page) {
      const error: AppError = new Error('Page not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(page)
  } catch (error) {
    console.error('Publish page error:', error)
    next(error)
  }
}

// 运营操作
export const operatePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    if (!id) {
      const error: AppError = new Error('Page ID is required')
      error.statusCode = 400
      throw error
    }
    
    const page = await PageService.operatePage(id)
    
    if (!page) {
      const error: AppError = new Error('Page not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(page)
  } catch (error) {
    console.error('Operate page error:', error)
    next(error)
  }
}

// 删除页面
export const deletePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    
    if (!id) {
      const error: AppError = new Error('Page ID is required')
      error.statusCode = 400
      throw error
    }
    
    const deleted = await PageService.deletePage(id)
    
    if (!deleted) {
      const error: AppError = new Error('Page not found')
      error.statusCode = 404
      throw error
    }
    
    res.json({ success: true, message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Delete page error:', error)
    next(error)
  }
}

