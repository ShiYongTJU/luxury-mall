// 简单的数据导出脚本 - 使用 Node.js 直接运行
// 运行: node scripts/export-data.js

const fs = require('fs')
const path = require('path')

// 读取 mockData.ts 文件
const mockDataPath = path.join(__dirname, '../src/api/mockData.ts')
const content = fs.readFileSync(mockDataPath, 'utf-8')

// 更精确的匹配：查找 export const mockProducts = [ 到对应的 ]
function extractArray(content, name) {
  const startPattern = new RegExp(`export const ${name}[^=]*=\\s*\\[`, 'm')
  const match = content.match(startPattern)
  if (!match) return null
  
  let start = match.index + match[0].length - 1 // 从 [ 开始
  let depth = 0
  let inString = false
  let stringChar = ''
  let i = start
  
  for (; i < content.length; i++) {
    const char = content[i]
    const prevChar = i > 0 ? content[i - 1] : ''
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true
      stringChar = char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
    }
    
    if (inString) continue
    
    if (char === '[') depth++
    else if (char === ']') {
      depth--
      if (depth === 0) {
        return content.substring(start, i + 1)
      }
    }
  }
  
  return null
}

// 提取 products
let products = []
const productsStr = extractArray(content, 'mockProducts')
if (productsStr) {
  try {
    products = eval('(' + productsStr + ')')
    console.log(`✅ Extracted ${products.length} products`)
  } catch (e) {
    console.error('Error parsing products:', e.message)
  }
}

// 提取 categories（需要处理 mockProducts 引用）
let categories = []
const categoriesStr = extractArray(content, 'mockCategories')
if (categoriesStr) {
  try {
    // 替换 mockProducts 引用
    let processedStr = categoriesStr
      .replace(/mockProducts\.filter\([^)]+\)/g, JSON.stringify(products))
      .replace(/mockProducts\.slice\([^)]+\)/g, (match) => {
        const sliceMatch = match.match(/slice\((\d+),\s*(\d+)\)/)
        if (sliceMatch) {
          const start = parseInt(sliceMatch[1])
          const end = parseInt(sliceMatch[2])
          return JSON.stringify(products.slice(start, end))
        }
        return JSON.stringify(products)
      })
      .replace(/mockProducts/g, JSON.stringify(products))
    
    categories = eval('(' + processedStr + ')')
    console.log(`✅ Extracted ${categories.length} categories`)
  } catch (e) {
    console.error('Error parsing categories:', e.message)
    console.error(e.stack)
  }
}

// 提取 homepage
let homepage = { components: [] }
const homepageStart = content.indexOf('export const mockHomePageData')
if (homepageStart !== -1) {
  let start = content.indexOf('{', homepageStart)
  let depth = 0
  let inString = false
  let stringChar = ''
  let i = start
  
  for (; i < content.length; i++) {
    const char = content[i]
    const prevChar = i > 0 ? content[i - 1] : ''
    
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true
      stringChar = char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
    }
    
    if (inString) continue
    
    if (char === '{') depth++
    else if (char === '}') {
      depth--
      if (depth === 0) {
        let homepageStr = content.substring(start, i + 1)
        // 处理引用
        homepageStr = homepageStr
          .replace(/mockProducts\.slice\((\d+),\s*(\d+)\)/g, (match, start, end) => {
            return JSON.stringify(products.slice(parseInt(start), parseInt(end)))
          })
          .replace(/mockProducts/g, JSON.stringify(products))
          .replace(/mockCarouselItems/g, '[]')
          .replace(/new Date\(Date\.now\(\)\s*\+\s*\d+\)\.toISOString\(\)/g, () => {
            return `"${new Date().toISOString()}"`
          })
        
        try {
          homepage = eval('(' + homepageStr + ')')
          console.log('✅ Extracted homepage data')
        } catch (e) {
          console.error('Error parsing homepage:', e.message)
        }
        break
      }
    }
  }
}

// 导出到 JSON
const outputPath = path.join(__dirname, '../../luxury-mall-backend/data/exported-data.json')
const outputDir = path.dirname(outputPath)

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const data = {
  products,
  categories,
  homePage: homepage
}

fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')
console.log(`\n✨ Export completed!`)
console.log(`📁 Saved to: ${outputPath}`)
console.log(`📊 Products: ${products.length}, Categories: ${categories.length}`)
