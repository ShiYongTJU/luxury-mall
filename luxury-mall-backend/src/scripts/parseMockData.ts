import * as fs from 'fs'
import * as path from 'path'
import { Product, Category, HomePageData } from '../types/product'
import { Database } from '../database/db'

// 查找数组的结束位置（匹配括号）
function findArrayEnd(content: string, startPos: number): number {
  let depth = 0
  let inString = false
  let stringChar = ''
  let i = startPos
  
  for (; i < content.length; i++) {
    const char = content[i]
    const prevChar = i > 0 ? content[i - 1] : ''
    
    // 处理字符串
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      inString = true
      stringChar = char
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false
    }
    
    if (inString) continue
    
    // 处理括号
    if (char === '[') {
      depth++
    } else if (char === ']') {
      depth--
      if (depth === 0) {
        return i + 1
      }
    }
  }
  
  return -1
}

// 查找对象的结束位置
function findObjectEnd(content: string, startPos: number): number {
  let depth = 0
  let inString = false
  let stringChar = ''
  let i = startPos
  
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
    
    if (char === '{') {
      depth++
    } else if (char === '}') {
      depth--
      if (depth === 0) {
        return i + 1
      }
    }
  }
  
  return -1
}

async function importData() {
  try {
    console.log('📦 Importing mock data from frontend project...')
    
    const mockDataPath = path.join(__dirname, '../../../plan/src/api/mockData.ts')
    
    if (!fs.existsSync(mockDataPath)) {
      console.error(`❌ Mock data file not found: ${mockDataPath}`)
      return
    }
    
    const content = fs.readFileSync(mockDataPath, 'utf-8')
    
    // 解析 products
    console.log('📝 Parsing products...')
    const productsMatch = content.match(/export const mockProducts[^=]*=\s*(\[)/)
    if (productsMatch) {
      const startPos = productsMatch.index! + productsMatch[0].length - 1
      const endPos = findArrayEnd(content, startPos)
      
      if (endPos > startPos) {
        let productsStr = content.substring(startPos, endPos)
        // 移除注释
        productsStr = productsStr.replace(/\/\*[\s\S]*?\*\//g, '')
        productsStr = productsStr.replace(/\/\/.*$/gm, '')
        
        try {
          const products: Product[] = new Function('return ' + productsStr)()
          Database.saveProducts(products)
          console.log(`✅ Imported ${products.length} products`)
        } catch (error) {
          console.error('Error parsing products:', error)
        }
      }
    }
    
    // 解析 categories
    console.log('📝 Parsing categories...')
    const categoriesMatch = content.match(/export const mockCategories[^=]*=\s*(\[)/)
    if (categoriesMatch) {
      const startPos = categoriesMatch.index! + categoriesMatch[0].length - 1
      const endPos = findArrayEnd(content, startPos)
      
      if (endPos > startPos) {
        let categoriesStr = content.substring(startPos, endPos)
        categoriesStr = categoriesStr.replace(/\/\*[\s\S]*?\*\//g, '')
        categoriesStr = categoriesStr.replace(/\/\/.*$/gm, '')
        
        try {
          const categories: Category[] = new Function('return ' + categoriesStr)()
          Database.saveCategories(categories)
          console.log(`✅ Imported ${categories.length} categories`)
        } catch (error) {
          console.error('Error parsing categories:', error)
        }
      }
    }
    
    // 解析 homepage
    console.log('📝 Parsing homepage data...')
    const homepageMatch = content.match(/export const mockHomePageData[^=]*=\s*(\{)/)
    if (homepageMatch) {
      const startPos = homepageMatch.index! + homepageMatch[0].length - 1
      const endPos = findObjectEnd(content, startPos)
      
      if (endPos > startPos) {
        let homepageStr = content.substring(startPos, endPos)
        homepageStr = homepageStr.replace(/\/\*[\s\S]*?\*\//g, '')
        homepageStr = homepageStr.replace(/\/\/.*$/gm, '')
        
        // 处理 Date.now() 等表达式
        homepageStr = homepageStr.replace(/new Date\([^)]*\)\.toISOString\(\)/g, `"${new Date().toISOString()}"`)
        homepageStr = homepageStr.replace(/Date\.now\(\)\s*\+\s*\d+/g, (match) => {
          const num = parseInt(match.match(/\d+/)![0])
          return (Date.now() + num).toString()
        })
        
        try {
          const homepage: HomePageData = new Function('return ' + homepageStr)()
          Database.saveHomePageData(homepage)
          console.log('✅ Imported homepage data')
        } catch (error) {
          console.error('Error parsing homepage:', error)
        }
      }
    }
    
    console.log('✨ Data import completed!')
  } catch (error) {
    console.error('❌ Import error:', error)
  }
}

importData()
