import * as fs from 'fs'
import * as path from 'path'
import { Product, Category, HomePageData } from '../types/product'
import { Database } from '../database/db'

async function importData() {
  try {
    console.log('📦 Importing mock data...')
    
    // 读取导出的 JSON 文件
    const exportedDataPath = path.join(__dirname, '../../data/exported-data.json')
    
    if (!fs.existsSync(exportedDataPath)) {
      console.error('❌ Exported data file not found!')
      console.log('💡 Please run the export script from frontend project first:')
      console.log('   cd plan && node scripts/export-data.js')
      return
    }
    
    console.log('📂 Reading from exported JSON file...')
    const data = JSON.parse(fs.readFileSync(exportedDataPath, 'utf-8'))
    
    if (data.products && Array.isArray(data.products)) {
      Database.saveProducts(data.products)
      console.log(`✅ Imported ${data.products.length} products`)
    } else {
      console.log('⚠️  No products found in exported data')
    }
    
    if (data.categories && Array.isArray(data.categories)) {
      Database.saveCategories(data.categories)
      console.log(`✅ Imported ${data.categories.length} categories`)
    } else {
      console.log('⚠️  No categories found in exported data')
    }
    
    if (data.homePage) {
      Database.saveHomePageData(data.homePage)
      console.log('✅ Imported homepage data')
    } else {
      console.log('⚠️  No homepage data found in exported data')
    }
    
    console.log('✨ Data import completed!')
    
  } catch (error) {
    console.error('❌ Import error:', error)
  }
}

importData()
