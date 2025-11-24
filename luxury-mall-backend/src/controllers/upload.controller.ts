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
    const fileName = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${imageType}`
    
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

