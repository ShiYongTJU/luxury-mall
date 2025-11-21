import * as fs from 'fs'
import * as path from 'path'
import { Product, Category, HomePageData } from '../types/product'
import { Database } from '../database/db'

// 从前端项目读取 mock 数据
const FRONTEND_DIR = path.join(__dirname, '../../../plan/src/api')
const mockDataPath = path.join(FRONTEND_DIR, 'mockData.ts')

// 简单的 JSON 数据提取函数
function extractJsonFromFile(content: string, exportName: string): any {
  // 查找 export const mockProducts = [...] 这样的模式
  const regex = new RegExp(`export const ${exportName}[^=]*=\\s*([\\s\\S]*?);`, 'm')
  const match = content.match(regex)
  
  if (!match) {
    return null
  }
  
  try {
    // 移除注释和类型标注，只保留 JSON 数据
    let jsonStr = match[1].trim()
    
    // 如果是数组或对象，直接解析
    if (jsonStr.startsWith('[') || jsonStr.startsWith('{')) {
      // 处理 TypeScript 特定的语法
      jsonStr = jsonStr
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
        .replace(/\/\/.*$/gm, '') // 移除行注释
      
      return JSON.parse(jsonStr)
    }
    
    return null
  } catch (error) {
    console.error(`Error parsing ${exportName}:`, error)
    return null
  }
}

async function migrateData() {
  try {
    console.log('📦 Starting data migration...')
    
    // 读取前端 mockData.ts 文件
    if (!fs.existsSync(mockDataPath)) {
      console.error(`❌ Mock data file not found: ${mockDataPath}`)
      console.log('Please ensure the frontend project is in the correct location')
      return
    }

    const mockDataContent = fs.readFileSync(mockDataPath, 'utf-8')
    
    // 由于 TypeScript 文件包含类型定义，我们需要手动解析
    // 更简单的方法：直接读取并执行（在安全的环境中）
    // 或者我们可以创建一个 JSON 导出文件
    
    // 临时方案：创建一个 Node.js 脚本来执行 TypeScript 文件
    console.log('📝 Reading mock data from frontend project...')
    
    // 使用动态导入（需要将 .ts 文件编译或使用 ts-node）
    // 更实用的方法：创建一个数据导出脚本在前端项目中
    
    console.log('⚠️  Please run the migration script from the frontend project first')
    console.log('   Or manually copy the data to data/products.json, data/categories.json, etc.')
    
    // 创建示例数据结构
    const sampleProducts: Product[] = []
    const sampleCategories: Category[] = []
    const sampleHomePage: HomePageData = { components: [] }
    
    // 如果数据文件已存在，跳过
    const dataDir = path.join(__dirname, '../../data')
    if (fs.existsSync(path.join(dataDir, 'products.json'))) {
      console.log('✅ Data files already exist, skipping migration')
      return
    }
    
    Database.saveProducts(sampleProducts)
    Database.saveCategories(sampleCategories)
    Database.saveHomePageData(sampleHomePage)
    
    console.log('✨ Data migration completed!')
    console.log('📌 Note: You may need to manually populate the data files')
  } catch (error) {
    console.error('❌ Migration error:', error)
  }
}

// 运行迁移
migrateData()
