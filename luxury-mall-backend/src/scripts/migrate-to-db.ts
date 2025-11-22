import * as fs from 'fs'
import * as path from 'path'
import { Pool } from 'pg'
import { initDatabase } from '../database/pg-db'

const DATA_DIR = path.join(__dirname, '../../data')

// 读取 JSON 文件
function readJsonFile<T>(filePath: string): T {
  const data = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(data)
}

async function migrateUsers(pool: Pool) {
  const usersFile = path.join(DATA_DIR, 'users.json')
  if (!fs.existsSync(usersFile)) {
    console.log('users.json 不存在，跳过用户迁移')
    return
  }

  const users = readJsonFile<any[]>(usersFile)
  console.log(`开始迁移 ${users.length} 个用户...`)

  for (const user of users) {
    try {
      await pool.query(
        `INSERT INTO users (id, username, phone, email, password, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [
          user.id,
          user.username,
          user.phone,
          user.email || null,
          user.password,
          new Date(user.createTime),
          new Date(user.updateTime)
        ]
      )
    } catch (error: any) {
      if (error.code !== '23505') { // 忽略唯一约束错误
        console.error(`迁移用户 ${user.id} 失败:`, error.message)
      }
    }
  }
  console.log('用户迁移完成')
}

async function migrateAddresses(pool: Pool) {
  const addressesFile = path.join(DATA_DIR, 'addresses.json')
  if (!fs.existsSync(addressesFile)) {
    console.log('addresses.json 不存在，跳过地址迁移')
    return
  }

  const addresses = readJsonFile<any[]>(addressesFile)
  console.log(`开始迁移 ${addresses.length} 个地址...`)

  let successCount = 0
  let failCount = 0

  for (const addr of addresses) {
    try {
      // 先检查用户是否存在
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [addr.userId])
      if (userCheck.rows.length === 0) {
        console.warn(`跳过地址 ${addr.id}：用户 ${addr.userId} 不存在`)
        failCount++
        continue
      }

      await pool.query(
        `INSERT INTO addresses (id, user_id, name, phone, province, city, district, detail, is_default, tag, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          addr.id,
          addr.userId,
          addr.name,
          addr.phone,
          addr.province,
          addr.city,
          addr.district,
          addr.detail,
          addr.isDefault || false,
          addr.tag || null
        ]
      )
      successCount++
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`迁移地址 ${addr.id} 失败:`, error.message)
        failCount++
      }
    }
  }
  console.log(`地址迁移完成（成功: ${successCount}, 失败: ${failCount}）`)
}

async function migrateProducts(pool: Pool) {
  const productsFile = path.join(DATA_DIR, 'products.json')
  if (!fs.existsSync(productsFile)) {
    console.log('products.json 不存在，跳过商品迁移')
    return
  }

  const products = readJsonFile<any[]>(productsFile)
  console.log(`开始迁移 ${products.length} 个商品...`)

  for (const product of products) {
    try {
      await pool.query(
        `INSERT INTO products (id, name, description, image, price, original_price, tag, category, sub_category, brand, images, detail_description, highlights, specs, reviews, services, shipping_info, stock, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          product.id,
          product.name,
          product.description || null,
          product.image,
          product.price,
          product.originalPrice || null,
          product.tag || null,
          product.category || null,
          product.subCategory || null,
          product.brand || null,
          product.images ? JSON.stringify(product.images) : null,
          product.detailDescription || null,
          product.highlights ? JSON.stringify(product.highlights) : null,
          product.specs ? JSON.stringify(product.specs) : null,
          product.reviews ? JSON.stringify(product.reviews) : null,
          product.services ? JSON.stringify(product.services) : null,
          product.shippingInfo || null,
          product.stock || 0
        ]
      )
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`迁移商品 ${product.id} 失败:`, error.message)
      }
    }
  }
  console.log('商品迁移完成')
}

async function migrateOrders(pool: Pool) {
  const ordersFile = path.join(DATA_DIR, 'orders.json')
  if (!fs.existsSync(ordersFile)) {
    console.log('orders.json 不存在，跳过订单迁移')
    return
  }

  const orders = readJsonFile<any[]>(ordersFile)
  console.log(`开始迁移 ${orders.length} 个订单...`)

  let successCount = 0
  let failCount = 0

  for (const order of orders) {
    try {
      // 先检查用户是否存在
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [order.userId])
      if (userCheck.rows.length === 0) {
        console.warn(`跳过订单 ${order.id}：用户 ${order.userId} 不存在`)
        failCount++
        continue
      }

      // 插入订单
      await pool.query(
        `INSERT INTO orders (id, user_id, order_no, total_price, status, create_time, pay_time, ship_time, deliver_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          order.id,
          order.userId,
          order.orderNo,
          order.totalPrice,
          order.status,
          new Date(order.createTime),
          order.payTime ? new Date(order.payTime) : null,
          order.shipTime ? new Date(order.shipTime) : null,
          order.deliverTime ? new Date(order.deliverTime) : null
        ]
      )

      // 插入订单项
      if (order.items && Array.isArray(order.items)) {
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i]
          try {
            await pool.query(
              `INSERT INTO order_items (id, order_id, product_id, name, image, price, quantity, selected_specs)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
               ON CONFLICT (id) DO NOTHING`,
              [
                `${order.id}-item-${i}`,
                order.id,
                item.productId,
                item.name,
                item.image,
                item.price,
                item.quantity,
                item.selectedSpecs ? JSON.stringify(item.selectedSpecs) : null
              ]
            )
          } catch (error: any) {
            console.warn(`迁移订单项 ${order.id}-item-${i} 失败:`, error.message)
          }
        }
      }

      // 插入订单地址
      if (order.address) {
        try {
          await pool.query(
            `INSERT INTO order_addresses (id, order_id, name, phone, province, city, district, detail, is_default, tag)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [
              `${order.id}-addr`,
              order.id,
              order.address.name,
              order.address.phone,
              order.address.province,
              order.address.city,
              order.address.district,
              order.address.detail,
              order.address.isDefault || false,
              order.address.tag || null
            ]
          )
        } catch (error: any) {
          console.warn(`迁移订单地址 ${order.id}-addr 失败:`, error.message)
        }
      }
      
      successCount++
    } catch (error: any) {
      console.error(`迁移订单 ${order.id} 失败:`, error.message)
      failCount++
    }
  }
  console.log(`订单迁移完成（成功: ${successCount}, 失败: ${failCount}）`)
}

async function migrateRegions(pool: Pool) {
  const regionsFile = path.join(DATA_DIR, 'regions.json')
  if (!fs.existsSync(regionsFile)) {
    console.log('regions.json 不存在，跳过地区迁移')
    return
  }

  const regions = readJsonFile<any[]>(regionsFile)
  console.log(`开始迁移 ${regions.length} 个地区...`)

  for (const region of regions) {
    try {
      await pool.query(
        `INSERT INTO regions (code, name, parent_code, level)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO NOTHING`,
        [
          region.code,
          region.name,
          region.parentCode || null,
          region.level || 1
        ]
      )
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`迁移地区 ${region.code} 失败:`, error.message)
      }
    }
  }
  console.log('地区迁移完成')
}

async function migrateCategories(pool: Pool) {
  const categoriesFile = path.join(DATA_DIR, 'categories.json')
  if (!fs.existsSync(categoriesFile)) {
    console.log('categories.json 不存在，跳过分类迁移')
    return
  }

  const categoriesData = readJsonFile<any[]>(categoriesFile)
  console.log(`开始迁移分类数据...`)
  
  let mainCategoryCount = 0
  let subCategoryCount = 0
  
  // 遍历每个一级分类
  for (const category of categoriesData) {
    if (!category.id || !category.name) {
      console.warn('跳过无效的分类数据:', category)
      continue
    }
    
    // 迁移一级分类
    try {
      // 使用 id 作为 code（如果没有单独的 code 字段）
      const categoryCode = category.code || category.id
      
      await pool.query(
        `INSERT INTO categories (id, name, code, parent_id, level, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           code = EXCLUDED.code,
           sort_order = EXCLUDED.sort_order`,
        [
          category.id,
          category.name,
          categoryCode,
          null, // parent_id 为 NULL 表示一级分类
          1, // level 1 表示一级分类
          mainCategoryCount // 使用索引作为 sort_order
        ]
      )
      mainCategoryCount++
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`迁移一级分类 ${category.id} 失败:`, error.message)
      }
    }
    
    // 迁移子分类
    if (category.subCategories && Array.isArray(category.subCategories)) {
      for (let i = 0; i < category.subCategories.length; i++) {
        const subCat = category.subCategories[i]
        if (!subCat.id || !subCat.name) {
          continue
        }
        
        try {
          const subCategoryCode = subCat.code || subCat.id
          
          await pool.query(
            `INSERT INTO categories (id, name, code, parent_id, level, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               code = EXCLUDED.code,
               parent_id = EXCLUDED.parent_id,
               sort_order = EXCLUDED.sort_order`,
            [
              subCat.id,
              subCat.name,
              subCategoryCode,
              category.id, // parent_id 指向一级分类
              2, // level 2 表示二级分类
              i // 使用索引作为 sort_order
            ]
          )
          subCategoryCount++
        } catch (error: any) {
          if (error.code !== '23505') {
            console.error(`迁移子分类 ${subCat.id} 失败:`, error.message)
          }
        }
      }
    }
  }
  
  console.log(`分类迁移完成（${mainCategoryCount} 个一级分类，${subCategoryCount} 个子分类）`)
}

async function migrateHomepageComponents(pool: Pool) {
  console.log('初始化首页组件配置...')
  
  // 默认组件配置
  const defaultComponents = [
    {
      id: 'carousel-1',
      type: 'carousel',
      title: '热门推荐',
      config: { limit: 5 },
      sort_order: 1,
      is_enabled: true
    },
    {
      id: 'seckill-1',
      type: 'seckill',
      title: '限时秒杀',
      config: { limit: 10 }, // 使用统一后的标准 tag: 'seckill'
      sort_order: 2,
      is_enabled: true
    },
    {
      id: 'groupbuy-1',
      type: 'groupbuy',
      title: '团购优惠',
      config: { limit: 10 },
      sort_order: 3,
      is_enabled: true
    },
    {
      id: 'product-list-1',
      type: 'productList',
      title: '精选商品',
      config: { limit: 20 },
      sort_order: 4,
      is_enabled: true
    },
    {
      id: 'guess-you-like-1',
      type: 'guessYouLike',
      title: '猜你喜欢',
      config: { limit: 20 },
      sort_order: 5,
      is_enabled: true
    }
  ]
  
  for (const component of defaultComponents) {
    try {
      await pool.query(
        `INSERT INTO homepage_components (id, type, title, config, sort_order, is_enabled, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          component.id,
          component.type,
          component.title,
          JSON.stringify(component.config),
          component.sort_order,
          component.is_enabled
        ]
      )
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`初始化组件 ${component.id} 失败:`, error.message)
      }
    }
  }
  
  console.log('首页组件配置初始化完成')
}

async function migrateCategoryComponents(pool: Pool) {
  console.log('初始化分类页组件配置...')
  
  // 获取所有一级分类
  const mainCategoriesResult = await pool.query(`
    SELECT id, name, code, sort_order
    FROM categories
    WHERE parent_id IS NULL
    ORDER BY sort_order, name
  `)
  
  if (mainCategoriesResult.rows.length === 0) {
    console.log('没有找到一级分类，跳过分类页组件配置初始化')
    return
  }
  
  // 为每个一级分类创建组件配置
  for (const category of mainCategoriesResult.rows) {
    try {
      const componentId = `category-${category.id}`
      await pool.query(
        `INSERT INTO category_components (id, category_id, category_code, title, icon, config, sort_order, is_enabled, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO NOTHING`,
        [
          componentId,
          category.id,
          category.code,
          category.name, // 默认使用分类名称作为标题
          '', // 默认图标为空
          JSON.stringify({ productsLimit: 50 }), // 默认每个子分类显示50个商品
          category.sort_order || 0,
          true
        ]
      )
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`初始化分类页组件 ${category.id} 失败:`, error.message)
      }
    }
  }
  
  console.log(`分类页组件配置初始化完成（${mainCategoriesResult.rows.length} 个分类）`)
}

async function main() {
  console.log('开始数据迁移...')
  
  // 初始化数据库连接
  const pool = initDatabase()

  try {
    // 读取并执行 SQL 脚本创建表
    // __dirname 在编译后是 /app/dist/scripts
    console.log(`当前脚本目录: ${__dirname}`)
    
    // 尝试多个可能的路径
    const possiblePaths = [
      path.join(__dirname, '../database/schema.sql'),  // /app/dist/database/schema.sql
      path.join(__dirname, '../../src/database/schema.sql'),  // /app/src/database/schema.sql
      '/app/src/database/schema.sql',  // 绝对路径
      '/app/dist/database/schema.sql'  // 绝对路径
    ]
    
    let schemaPath: string | null = null
    
    // 查找存在的文件
    for (const testPath of possiblePaths) {
      console.log(`检查路径: ${testPath}`)
      if (fs.existsSync(testPath)) {
        const stats = fs.statSync(testPath)
        if (stats.isFile()) {
          schemaPath = testPath
          console.log(`找到 SQL 文件: ${schemaPath}`)
          break
        } else {
          console.log(`路径存在但不是文件: ${testPath} (是目录)`)
        }
      } else {
        console.log(`路径不存在: ${testPath}`)
      }
    }
    
    // 如果没找到，列出目录内容以便调试
    if (!schemaPath) {
      console.error('未找到 schema.sql 文件，尝试列出相关目录:')
      const debugDirs = [
        path.join(__dirname, '..'),
        path.join(__dirname, '../database'),
        path.join(__dirname, '../../src'),
        path.join(__dirname, '../../src/database'),
        '/app',
        '/app/src',
        '/app/dist'
      ]
      for (const dir of debugDirs) {
        if (fs.existsSync(dir)) {
          try {
            const contents = fs.readdirSync(dir)
            console.log(`目录 ${dir} 的内容:`, contents)
          } catch (e: any) {
            console.log(`无法读取目录 ${dir}: ${e.message}`)
          }
        }
      }
      throw new Error('未找到 schema.sql 文件')
    }
    
    console.log(`读取 SQL 脚本: ${schemaPath}`)
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    
    // 分割 SQL 语句并逐个执行（PostgreSQL 不支持一次执行多个语句）
    // 使用更智能的分割方式，按行分割后合并完整的语句
    const lines = schema.split('\n')
    const statements: string[] = []
    let currentStatement = ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      // 跳过注释和空行
      if (!trimmed || trimmed.startsWith('--')) {
        continue
      }
      
      currentStatement += line + '\n'
      
      // 如果行以分号结尾，说明是一个完整的语句
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim()
        if (stmt) {
          statements.push(stmt)
        }
        currentStatement = ''
      }
    }
    
    // 添加最后一个语句（如果没有分号结尾）
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }
    
    console.log(`准备执行 ${statements.length} 条 SQL 语句...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          await pool.query(statement)
        } catch (error: any) {
          // 忽略表已存在的错误
          if (error.code === '42P07' || error.message?.includes('already exists')) {
            console.log(`表已存在，跳过语句 ${i + 1}`)
          } else {
            console.warn(`执行 SQL 语句 ${i + 1} 时出错: ${error.message}`)
            console.warn(`语句预览: ${statement.substring(0, 100)}...`)
          }
        }
      }
    }
    console.log('数据库表结构创建完成')

    // 迁移数据（按依赖顺序）
    // 1. 先迁移基础数据（用户、分类、地区）
    await migrateUsers(pool)
    await migrateCategories(pool)  // 分类需要在商品之前迁移
    await migrateRegions(pool)
    
    // 2. 迁移商品数据（依赖分类）
    await migrateProducts(pool)
    
    // 3. 迁移用户相关数据（依赖用户）
    await migrateAddresses(pool)
    await migrateOrders(pool)
    
    // 4. 初始化组件配置（依赖分类和商品）
    await migrateHomepageComponents(pool)
    await migrateCategoryComponents(pool)  // 分类迁移后，才能初始化分类页组件配置

    console.log('数据迁移完成！')
  } catch (error) {
    console.error('迁移失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

if (require.main === module) {
  main()
}


