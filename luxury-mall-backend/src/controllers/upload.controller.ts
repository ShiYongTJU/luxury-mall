import { Request, Response, NextFunction } from 'express'
import fs from 'fs'
import path from 'path'

interface AppError extends Error {
  statusCode?: number
}

// 图片上传接口
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 检查是否有文件
    if (!req.body.file) {
      const error: AppError = new Error('没有上传文件')
      error.statusCode = 400
      throw error
    }

    // 处理 base64 图片
    const base64Data = req.body.file
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/)
    
    if (!matches) {
      const error: AppError = new Error('无效的图片格式')
      error.statusCode = 400
      throw error
    }

    const imageType = matches[1]
    const imageData = matches[2]
    const buffer = Buffer.from(imageData, 'base64')

    // 生成文件名
    const fileName = `image_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${imageType}`
    
    // 确保上传目录存在
    const uploadDir = path.join(__dirname, '../../uploads/images')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 保存文件
    const filePath = path.join(uploadDir, fileName)
    fs.writeFileSync(filePath, buffer)

    // 返回文件URL（这里返回相对路径，实际部署时需要配置静态文件服务）
    const fileUrl = `/uploads/images/${fileName}`

    res.json({
      url: fileUrl,
      filename: fileName,
      size: buffer.length,
      format: imageType
    })
  } catch (error) {
    console.error('Upload image error:', error)
    next(error)
  }
}

// 获取服务器上已上传的图片文件列表
export const getUploadedImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const uploadDir = path.join(__dirname, '../../uploads/images')
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] })
    }

    const files = fs.readdirSync(uploadDir)
    const imageFiles = files
      .filter(file => {
        const filePath = path.join(uploadDir, file)
        const stats = fs.statSync(filePath)
        return stats.isFile() && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file)
      })
      .map(file => {
        const filePath = path.join(uploadDir, file)
        const stats = fs.statSync(filePath)
        const fileUrl = `/uploads/images/${file}`
        
        return {
          filename: file,
          url: fileUrl,
          size: stats.size,
          uploadTime: stats.birthtime.toISOString(),
          updateTime: stats.mtime.toISOString()
        }
      })
      .sort((a, b) => new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime())

    res.json({ files: imageFiles })
  } catch (error) {
    console.error('Get uploaded images error:', error)
    next(error)
  }
}

// 删除服务器上的图片文件
export const deleteUploadedImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { filename } = req.params
    
    if (!filename) {
      const error: AppError = new Error('文件名不能为空')
      error.statusCode = 400
      throw error
    }

    // 安全检查：防止路径遍历攻击
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      const error: AppError = new Error('无效的文件名')
      error.statusCode = 400
      throw error
    }

    const uploadDir = path.join(__dirname, '../../uploads/images')
    const filePath = path.join(uploadDir, filename)

    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      const error: AppError = new Error('文件不存在')
      error.statusCode = 404
      throw error
    }

    // 检查是否是文件（不是目录）
    const stats = fs.statSync(filePath)
    if (!stats.isFile()) {
      const error: AppError = new Error('不是有效的文件')
      error.statusCode = 400
      throw error
    }

    // 删除文件
    fs.unlinkSync(filePath)

    res.json({ success: true, message: '文件删除成功' })
  } catch (error) {
    console.error('Delete uploaded image error:', error)
    next(error)
  }
}
