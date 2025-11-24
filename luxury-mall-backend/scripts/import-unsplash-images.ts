/**
 * 将 unsplash-images.json 文件中的图片数据导入到数据库
 * 
 * 使用方法：
 * npm run import-unsplash-images
 */

import { initDatabase, addImage } from '../src/database/pg-db'
import { Image } from '../src/types/image'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 初始化数据库（延迟初始化，确保环境变量已加载）
let dbInitialized = false

async function ensureDatabase() {
  if (!dbInitialized) {
    console.log('正在初始化数据库连接...')
    console.log(`数据库主机: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`数据库端口: ${process.env.DB_PORT || '5432'}`)
    console.log(`数据库名称: ${process.env.DB_NAME || 'luxury_mall'}`)
    
    initDatabase()
    dbInitialized = true
    
    // 等待数据库连接建立，并测试连接
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    try {
      const { getPool } = await import('../src/database/pg-db')
      await getPool().query('SELECT NOW()')
      console.log('✓ 数据库连接测试成功\n')
    } catch (error: any) {
      console.error('✗ 数据库连接测试失败:', error.message)
      throw new Error('无法连接到数据库，请检查数据库配置和连接')
    }
  }
}

/**
 * 清空图片表
 */
async function clearImagesTable() {
  try {
    const { getPool } = await import('../src/database/pg-db')
    const pool = getPool()
    
    console.log('正在清空图片表...')
    const result = await pool.query('DELETE FROM images')
    console.log(`✓ 已删除 ${result.rowCount} 条记录`)
    console.log('')
  } catch (error: any) {
    console.error('清空图片表失败:', error.message)
    throw error
  }
}

/**
 * 导入图片数据到数据库
 */
async function importImages() {
  try {
    // 确保数据库已初始化
    await ensureDatabase()
    console.log('数据库连接已建立\n')
    
    // 清空图片表
    await clearImagesTable()
    
    // 读取 JSON 文件
    const jsonPath = path.join(__dirname, 'unsplash-images.json')
    
    if (!fs.existsSync(jsonPath)) {
      console.error(`错误: 文件不存在 ${jsonPath}`)
      process.exit(1)
    }
    
    console.log(`读取文件: ${jsonPath}`)
    const fileContent = fs.readFileSync(jsonPath, 'utf-8')
    const images: any[] = JSON.parse(fileContent)
    
    console.log(`找到 ${images.length} 张图片`)
    console.log('开始导入到数据库...\n')
    
    let successCount = 0
    let errorCount = 0
    
    // 批量导入
    for (let i = 0; i < images.length; i++) {
      const imageData = images[i]
      
      try {
        // 转换为数据库格式
        const image: Omit<Image, 'id'> & { id?: string } = {
          id: imageData.id, // 使用 JSON 中的 ID
          name: imageData.name,
          url: imageData.url,
          description: imageData.description || undefined,
          category: imageData.category || undefined,
          tags: imageData.tags || undefined,
          width: imageData.width || undefined,
          height: imageData.height || undefined,
          size: imageData.size || undefined,
          format: imageData.format || undefined
        }
        
        // 插入数据库
        await addImage(image)
        successCount++
        
        // 每 10 张显示一次进度
        if ((i + 1) % 10 === 0 || i === images.length - 1) {
          console.log(`进度: ${i + 1}/${images.length} (成功: ${successCount}, 失败: ${errorCount})`)
        }
        
        // 添加小延迟，避免数据库压力过大
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      } catch (error: any) {
        errorCount++
        console.error(`导入失败 [${i + 1}]: ${imageData.name} - ${error.message}`)
        
        // 如果是重复键错误，继续处理
        if (error.message && error.message.includes('duplicate key')) {
          console.log(`  提示: 图片已存在，跳过`)
        }
      }
    }
    
    console.log('\n导入完成！')
    console.log(`总计: ${images.length} 张`)
    console.log(`成功: ${successCount} 张`)
    console.log(`失败: ${errorCount} 张`)
    
  } catch (error: any) {
    console.error('导入过程出错:', error)
    process.exit(1)
  }
}

// 运行导入
if (require.main === module) {
  importImages()
    .then(() => {
      console.log('\n脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('脚本执行失败:', error)
      process.exit(1)
    })
}

export { importImages }

