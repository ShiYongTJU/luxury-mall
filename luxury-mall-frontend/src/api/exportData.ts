// 数据导出脚本 - 将 mock 数据导出为 JSON
// 使用动态导入以支持 ES modules
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import * as fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function exportData() {
  try {
    // 动态导入 mock 数据
    const mockData = await import('./mockData.js')
    const { mockProducts, mockCategories, mockHomePageData } = mockData

    const outputDir = join(__dirname, '../../../luxury-mall-backend/data')

    // 确保目录存在
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // 导出数据
    const data = {
      products: mockProducts,
      categories: mockCategories,
      homePage: mockHomePageData
    }

    fs.writeFileSync(
      join(outputDir, 'exported-data.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    )

    console.log('✅ Data exported to luxury-mall-backend/data/exported-data.json')
  } catch (error) {
    console.error('❌ Export error:', error)
  }
}

exportData()

