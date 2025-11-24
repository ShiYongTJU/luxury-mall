import { Request, Response, NextFunction } from 'express'
import { ImageService } from '../services/image.service'
import { Image } from '../types/image'

interface AppError extends Error {
  statusCode?: number
}

// 获取图片列表（支持查询和分页）
export const getImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      category,
      tags,
      format,
      minWidth,
      maxWidth,
      minHeight,
      maxHeight,
      minSize,
      maxSize,
      startTime,
      endTime,
      page = '1',
      pageSize = '10'
    } = req.query
    
    const params = {
      name: name as string | undefined,
      category: category as string | undefined,
      tags: tags as string | undefined,
      format: format as string | undefined,
      minWidth: minWidth ? parseInt(minWidth as string, 10) : undefined,
      maxWidth: maxWidth ? parseInt(maxWidth as string, 10) : undefined,
      minHeight: minHeight ? parseInt(minHeight as string, 10) : undefined,
      maxHeight: maxHeight ? parseInt(maxHeight as string, 10) : undefined,
      minSize: minSize ? parseInt(minSize as string, 10) : undefined,
      maxSize: maxSize ? parseInt(maxSize as string, 10) : undefined,
      startTime: startTime as string | undefined,
      endTime: endTime as string | undefined,
      page: parseInt(page as string, 10),
      pageSize: parseInt(pageSize as string, 10)
    }
    
    const result = await ImageService.queryImages(params)
    res.json(result)
  } catch (error) {
    console.error('Get images error:', error)
    next(error)
  }
}

// 根据 ID 获取图片详情
export const getImageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const image = await ImageService.getImageById(id)
    
    if (!image) {
      const error: AppError = new Error('Image not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(image)
  } catch (error) {
    console.error('Get image by id error:', error)
    next(error)
  }
}

// 更新图片
export const updateImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 支持两种方式：路径参数或请求体中的 id
    const id = req.params.id || req.body.id
    
    if (!id) {
      const error: AppError = new Error('Image ID is required')
      error.statusCode = 400
      throw error
    }
    
    // 从请求体中获取更新字段，排除 id
    const { id: _, ...updateFields } = req.body as Partial<Image> & { id?: string }
    
    // 检查是否有要更新的字段
    if (Object.keys(updateFields).length === 0) {
      const error: AppError = new Error('No fields to update')
      error.statusCode = 400
      throw error
    }
    
    const image = await ImageService.updateImage(id, updateFields)
    
    if (!image) {
      const error: AppError = new Error('Image not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(image)
  } catch (error) {
    console.error('Update image error:', error)
    next(error)
  }
}

// 新增图片
export const addImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const imageData = req.body as Omit<Image, 'id'> & { id?: string }
    
    // 验证必填字段
    if (!imageData.name || !imageData.url) {
      const error: AppError = new Error('Image name and URL are required')
      error.statusCode = 400
      throw error
    }
    
    const image = await ImageService.addImage(imageData)
    
    res.status(201).json(image)
  } catch (error) {
    console.error('Add image error:', error)
    next(error)
  }
}

