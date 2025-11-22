import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '../../data')

// Tag 映射规则：将旧 tag 统一为标准 tag
const TAG_MAPPING: Record<string, string> = {
  '限时': 'seckill',      // 限时 -> 秒杀
  '限时秒杀': 'seckill',  // 限时秒杀 -> 秒杀
  '秒杀': 'seckill',      // 秒杀 -> 秒杀
  '团购': 'groupbuy',     // 团购 -> 团购
  '热销': 'hot',          // 热销 -> 热销
  '新品': 'new',          // 新品 -> 新品
  // 保留其他 tag 不变
}

// 统一 products.json 中的 tag
function normalizeProductsTags() {
  const productsFile = path.join(DATA_DIR, 'products.json')
  if (!fs.existsSync(productsFile)) {
    console.log('products.json 不存在，跳过')
    return
  }

  const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'))
  console.log(`开始统一 ${products.length} 个商品的 tag...`)

  let updatedCount = 0
  for (const product of products) {
    if (product.tag && TAG_MAPPING[product.tag]) {
      const oldTag = product.tag
      product.tag = TAG_MAPPING[product.tag]
      if (oldTag !== product.tag) {
        updatedCount++
      }
    }
  }

  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2), 'utf-8')
  console.log(`✓ 已更新 ${updatedCount} 个商品的 tag`)
  console.log('Tag 映射统计:')
  Object.entries(TAG_MAPPING).forEach(([oldTag, newTag]) => {
    const count = products.filter((p: any) => p.tag === newTag && (p.tag === oldTag || p.tag === newTag)).length
    if (count > 0) {
      console.log(`  ${oldTag} -> ${newTag}: ${count} 个商品`)
    }
  })
}

// 统一 categories.json 中商品的 tag
function normalizeCategoriesTags() {
  const categoriesFile = path.join(DATA_DIR, 'categories.json')
  if (!fs.existsSync(categoriesFile)) {
    console.log('categories.json 不存在，跳过')
    return
  }

  const categories = JSON.parse(fs.readFileSync(categoriesFile, 'utf-8'))
  console.log(`开始统一分类数据中 ${categories.length} 个分类的商品 tag...`)

  let updatedCount = 0
  for (const category of categories) {
    if (category.subCategories && Array.isArray(category.subCategories)) {
      for (const subCat of category.subCategories) {
        if (subCat.products && Array.isArray(subCat.products)) {
          for (const product of subCat.products) {
            if (product.tag && TAG_MAPPING[product.tag]) {
              const oldTag = product.tag
              product.tag = TAG_MAPPING[product.tag]
              if (oldTag !== product.tag) {
                updatedCount++
              }
            }
          }
        }
      }
    }
  }

  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2), 'utf-8')
  console.log(`✓ 已更新 ${updatedCount} 个商品的 tag`)
}

// 统一 homepage.json 中商品的 tag
function normalizeHomepageTags() {
  const homepageFile = path.join(DATA_DIR, 'homepage.json')
  if (!fs.existsSync(homepageFile)) {
    console.log('homepage.json 不存在，跳过')
    return
  }

  const homepage = JSON.parse(fs.readFileSync(homepageFile, 'utf-8'))
  console.log('开始统一首页数据中商品的 tag...')

  let updatedCount = 0
  if (homepage.components && Array.isArray(homepage.components)) {
    for (const component of homepage.components) {
      if (component.data) {
        // 处理轮播图数据（数组格式）
        if (Array.isArray(component.data)) {
          for (const item of component.data) {
            if (item.tag && TAG_MAPPING[item.tag]) {
              const oldTag = item.tag
              item.tag = TAG_MAPPING[item.tag]
              if (oldTag !== item.tag) {
                updatedCount++
              }
            }
          }
        } 
        // 处理其他组件数据（对象格式，包含 products 数组）
        else if (component.data.products && Array.isArray(component.data.products)) {
          for (const product of component.data.products) {
            if (product.tag && TAG_MAPPING[product.tag]) {
              const oldTag = product.tag
              product.tag = TAG_MAPPING[product.tag]
              if (oldTag !== product.tag) {
                updatedCount++
              }
            }
          }
        }
      }
    }
  }

  fs.writeFileSync(homepageFile, JSON.stringify(homepage, null, 2), 'utf-8')
  console.log(`✓ 已更新 ${updatedCount} 个商品的 tag`)
}

function main() {
  console.log('开始统一商品 tag 类型...')
  console.log('')
  
  normalizeProductsTags()
  console.log('')
  
  normalizeCategoriesTags()
  console.log('')
  
  normalizeHomepageTags()
  console.log('')
  
  console.log('✓ 所有 tag 统一完成！')
  console.log('')
  console.log('标准 tag 类型:')
  console.log('  - seckill: 秒杀')
  console.log('  - groupbuy: 团购')
  console.log('  - hot: 热销')
  console.log('  - new: 新品')
}

if (require.main === module) {
  main()
}

