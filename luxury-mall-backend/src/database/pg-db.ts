import { Pool, QueryResult } from 'pg'
import { User } from '../types/user'
import { Address, Order, OrderItem } from '../types/address'
import { Product, Category, HomePageData, PageComponent } from '../types/product'

// PostgreSQL 连接池
let pool: Pool | null = null

export function initDatabase(): Pool {
  if (pool) {
    return pool
  }

  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'luxury_mall',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })

  // 测试连接
  pool.query('SELECT NOW()', (err: Error | null) => {
    if (err) {
      console.error('数据库连接失败:', err)
    } else {
      console.log('数据库连接成功')
    }
  })

  return pool
}

export function getPool(): Pool {
  if (!pool) {
    return initDatabase()
  }
  return pool
}

// 用户相关
export async function getUsers(userId?: string): Promise<User[]> {
  const query = userId
    ? 'SELECT id, username, phone, email, create_time as "createTime", update_time as "updateTime" FROM users WHERE id = $1'
    : 'SELECT id, username, phone, email, create_time as "createTime", update_time as "updateTime" FROM users'
  
  const result = await getPool().query(query, userId ? [userId] : [])
  return result.rows.map((row: any) => ({
    ...row,
    createTime: row.createTime.toISOString(),
    updateTime: row.updateTime.toISOString()
  }))
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const result = await getPool().query(
    'SELECT * FROM users WHERE phone = $1',
    [phone]
  )
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    username: row.username,
    phone: row.phone,
    email: row.email,
    password: row.password,
    createTime: row.create_time.toISOString(),
    updateTime: row.update_time.toISOString()
  }
}

export async function createUser(user: Omit<User, 'createTime' | 'updateTime'>): Promise<void> {
  await getPool().query(
    `INSERT INTO users (id, username, phone, email, password, create_time, update_time)
     VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [user.id, user.username, user.phone, user.email || null, user.password]
  )
}

export async function updateUser(id: string, updates: Partial<User>): Promise<void> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.username) {
    fields.push(`username = $${paramIndex++}`)
    values.push(updates.username)
  }
  if (updates.phone) {
    fields.push(`phone = $${paramIndex++}`)
    values.push(updates.phone)
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`)
    values.push(updates.email || null)
  }
  if (updates.password) {
    fields.push(`password = $${paramIndex++}`)
    values.push(updates.password)
  }

  if (fields.length === 0) return

  fields.push(`update_time = CURRENT_TIMESTAMP`)
  values.push(id)

  await getPool().query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  )
}

// 地址相关
export async function getAddresses(userId?: string): Promise<Address[]> {
  const query = userId
    ? 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, create_time DESC'
    : 'SELECT * FROM addresses ORDER BY create_time DESC'
  
  const result = await getPool().query(query, userId ? [userId] : [])
  return result.rows.map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    district: row.district,
    detail: row.detail,
    isDefault: row.is_default,
    tag: row.tag || undefined
  }))
}

export async function getAddressById(id: string, userId?: string): Promise<Address | null> {
  const query = userId
    ? 'SELECT * FROM addresses WHERE id = $1 AND user_id = $2'
    : 'SELECT * FROM addresses WHERE id = $1'
  
  const result = await getPool().query(query, userId ? [id, userId] : [id])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    province: row.province,
    city: row.city,
    district: row.district,
    detail: row.detail,
    isDefault: row.is_default,
    tag: row.tag || undefined
  }
}

export async function createAddress(address: Address): Promise<void> {
  await getPool().query(
    `INSERT INTO addresses (id, user_id, name, phone, province, city, district, detail, is_default, tag, create_time, update_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
    [
      address.id,
      address.userId,
      address.name,
      address.phone,
      address.province,
      address.city,
      address.district,
      address.detail,
      address.isDefault,
      address.tag || null
    ]
  )
}

export async function updateAddress(id: string, updates: Partial<Address>, userId?: string): Promise<void> {
  const fields: string[] = []
  const values: any[] = []
  let paramIndex = 1

  if (updates.name) {
    fields.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
  if (updates.phone) {
    fields.push(`phone = $${paramIndex++}`)
    values.push(updates.phone)
  }
  if (updates.province) {
    fields.push(`province = $${paramIndex++}`)
    values.push(updates.province)
  }
  if (updates.city) {
    fields.push(`city = $${paramIndex++}`)
    values.push(updates.city)
  }
  if (updates.district) {
    fields.push(`district = $${paramIndex++}`)
    values.push(updates.district)
  }
  if (updates.detail) {
    fields.push(`detail = $${paramIndex++}`)
    values.push(updates.detail)
  }
  if (updates.isDefault !== undefined) {
    fields.push(`is_default = $${paramIndex++}`)
    values.push(updates.isDefault)
  }
  if (updates.tag !== undefined) {
    fields.push(`tag = $${paramIndex++}`)
    values.push(updates.tag || null)
  }

  if (fields.length === 0) return

  fields.push(`update_time = CURRENT_TIMESTAMP`)
  values.push(id)
  if (userId) {
    values.push(userId)
    await getPool().query(
      `UPDATE addresses SET ${fields.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
      values
    )
  } else {
    await getPool().query(
      `UPDATE addresses SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    )
  }
}

export async function deleteAddress(id: string, userId?: string): Promise<boolean> {
  const query = userId
    ? 'DELETE FROM addresses WHERE id = $1 AND user_id = $2'
    : 'DELETE FROM addresses WHERE id = $1'
  
  const result = await getPool().query(query, userId ? [id, userId] : [id])
  return (result.rowCount ?? 0) > 0
}

// 订单相关（简化实现，完整实现需要处理关联查询）
export async function getOrders(userId?: string): Promise<Order[]> {
  // 这里需要 JOIN 查询订单项和地址
  // 为简化，先返回基本结构
  const query = userId
    ? 'SELECT * FROM orders WHERE user_id = $1 ORDER BY create_time DESC'
    : 'SELECT * FROM orders ORDER BY create_time DESC'
  
  const result = await getPool().query(query, userId ? [userId] : [])
  
  // 需要查询订单项和地址
  const orders: Order[] = []
  for (const row of result.rows) {
    const itemsResult = await getPool().query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [row.id]
    )
    
    const addressResult = await getPool().query(
      'SELECT * FROM order_addresses WHERE order_id = $1',
      [row.id]
    )
    
      const items: OrderItem[] = itemsResult.rows.map((item: any) => ({
      productId: item.product_id,
      name: item.name,
      image: item.image,
      price: parseFloat(item.price),
      quantity: item.quantity,
      selectedSpecs: item.selected_specs ? JSON.parse(item.selected_specs) : undefined
    }))
    
    const addressRow = addressResult.rows[0]
    const address: Address = {
      id: addressRow.id,
      userId: '',
      name: addressRow.name,
      phone: addressRow.phone,
      province: addressRow.province,
      city: addressRow.city,
      district: addressRow.district,
      detail: addressRow.detail,
      isDefault: addressRow.is_default,
      tag: addressRow.tag || undefined
    }
    
    orders.push({
      id: row.id,
      userId: row.user_id,
      orderNo: row.order_no,
      items,
      address,
      totalPrice: parseFloat(row.total_price),
      status: row.status,
      createTime: row.create_time.toISOString(),
      payTime: row.pay_time?.toISOString(),
      shipTime: row.ship_time?.toISOString(),
      deliverTime: row.deliver_time?.toISOString()
    })
  }
  
  return orders
}

// 商品相关
export async function getProducts(): Promise<Product[]> {
  const result = await getPool().query('SELECT * FROM products ORDER BY create_time DESC')
  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    tag: row.tag,
    category: row.category,
    subCategory: row.sub_category,
    brand: row.brand,
    images: row.images ? JSON.parse(row.images) : undefined,
    detailDescription: row.detail_description,
    highlights: row.highlights ? JSON.parse(row.highlights) : undefined,
    specs: row.specs ? JSON.parse(row.specs) : undefined,
    reviews: row.reviews ? JSON.parse(row.reviews) : undefined,
    services: row.services ? JSON.parse(row.services) : undefined,
    shippingInfo: row.shipping_info,
    stock: row.stock
  }))
}

export async function getProductById(id: string): Promise<Product | null> {
  const result = await getPool().query('SELECT * FROM products WHERE id = $1', [id])
  if (result.rows.length === 0) return null
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    tag: row.tag,
    category: row.category,
    subCategory: row.sub_category,
    brand: row.brand,
    images: row.images ? JSON.parse(row.images) : undefined,
    detailDescription: row.detail_description,
    highlights: row.highlights ? JSON.parse(row.highlights) : undefined,
    specs: row.specs ? JSON.parse(row.specs) : undefined,
    reviews: row.reviews ? JSON.parse(row.reviews) : undefined,
    services: row.services ? JSON.parse(row.services) : undefined,
    shippingInfo: row.shipping_info,
    stock: row.stock
  }
}

// 分类相关
export async function getCategories(): Promise<Category[]> {
  const pool = getPool()
  
  // 从配置表获取启用的分类配置，按 sort_order 排序
  const categoryComponentsConfig = await pool.query(`
    SELECT cc.id, cc.category_id, cc.category_code, cc.title, cc.icon, cc.config, cc.sort_order,
           c.name as category_name, c.code as category_code_from_table
    FROM category_components cc
    INNER JOIN categories c ON cc.category_id = c.id
    WHERE cc.is_enabled = TRUE AND c.parent_id IS NULL
    ORDER BY cc.sort_order ASC, cc.create_time ASC
  `)
  
  // 如果没有配置，则使用默认逻辑（从 categories 表读取所有一级分类）
  let mainCategories: any[] = []
  
  if (categoryComponentsConfig.rows.length > 0) {
    // 使用配置表中的分类
    mainCategories = categoryComponentsConfig.rows.map(row => ({
      id: row.category_id,
      name: row.title || row.category_name,
      code: row.category_code || row.category_code_from_table,
      icon: row.icon || '',
      config: row.config ? JSON.parse(row.config) : {},
      sort_order: row.sort_order
    }))
  } else {
    // 默认逻辑：获取所有一级分类
    const defaultResult = await pool.query(`
      SELECT id, name, code, sort_order
      FROM categories
      WHERE parent_id IS NULL
      ORDER BY sort_order, name
    `)
    mainCategories = defaultResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      code: row.code,
      icon: '',
      config: {},
      sort_order: row.sort_order
    }))
  }
  
  const categories: Category[] = []
  
  for (const mainCat of mainCategories) {
    // 获取子分类
    const subCategoriesResult = await pool.query(`
      SELECT id, name, code, sort_order
      FROM categories
      WHERE parent_id = $1
      ORDER BY sort_order, name
    `, [mainCat.id])
    
    const subCategories = []
    
    // 从配置中获取每个子分类显示的商品数量限制
    const productsLimit = mainCat.config?.productsLimit || 50
    
    for (const subCat of subCategoriesResult.rows) {
      // 获取该子分类下的商品
      // 注意：商品表中的 category 存储的是分类的 code/id，sub_category 存储的是子分类的 name
      // 匹配策略：
      // 1. 精确匹配：sub_category = 子分类的 name（如 "手袋新品"）
      // 2. 关键词匹配：如果子分类 name 包含关键词（如 "新品"），匹配 subCategory = "新品" 的商品
      // 3. 主分类匹配：category = 主分类的 code（如 "new" 或 "bags"）
      
      // 构建查询条件
      const conditions: string[] = []
      const params: any[] = []
      let paramIndex = 1
      
      // 精确匹配子分类名称
      conditions.push(`sub_category = $${paramIndex++}`)
      params.push(subCat.name)
      
      // 关键词匹配：提取子分类 name 中的关键词
      // 例如："手袋新品" -> 匹配 subCategory = "新品" 的商品
      //      "2025新款系列手袋" -> 匹配 subCategory = "新品" 或 "手袋" 的商品
      const keywords = ['新品', '手袋', '系列', '新款']
      for (const keyword of keywords) {
        if (subCat.name.includes(keyword)) {
          conditions.push(`sub_category = $${paramIndex++}`)
          params.push(keyword)
        }
      }
      
      // 匹配主分类 code
      conditions.push(`category = $${paramIndex++}`)
      params.push(mainCat.code)
      
      // 添加 limit
      params.push(productsLimit)
      
      const productsResult = await pool.query(`
        SELECT DISTINCT * FROM products
        WHERE (${conditions.join(' OR ')})
        ORDER BY create_time DESC
        LIMIT $${paramIndex}
      `, params)
      
      const products = productsResult.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        image: row.image,
        price: parseFloat(row.price),
        originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
        tag: row.tag,
        category: row.category,
        subCategory: row.sub_category,
        brand: row.brand,
        images: row.images ? JSON.parse(row.images) : undefined,
        detailDescription: row.detail_description,
        highlights: row.highlights ? JSON.parse(row.highlights) : undefined,
        specs: row.specs ? JSON.parse(row.specs) : undefined,
        reviews: row.reviews ? JSON.parse(row.reviews) : undefined,
        services: row.services ? JSON.parse(row.services) : undefined,
        shippingInfo: row.shipping_info,
        stock: row.stock
      }))
      
      subCategories.push({
        id: subCat.id,
        name: subCat.name,
        products
      })
    }
    
    categories.push({
      id: mainCat.id,
      name: mainCat.name,
      icon: mainCat.icon,
      subCategories
    })
  }
  
  return categories
}

// 地区相关
export async function getRegions(): Promise<any[]> {
  const result = await getPool().query(`
    SELECT code, name, parent_code, level
    FROM regions
    ORDER BY level, name
  `)
  
  // 构建嵌套结构
  const regionMap = new Map<string, any>()
  const rootRegions: any[] = []
  
  // 第一遍：创建所有节点
  result.rows.forEach((row: any) => {
    const region = {
      code: row.code,
      name: row.name,
      parentCode: row.parent_code,
      level: row.level,
      children: [] as any[]
    }
    regionMap.set(row.code, region)
  })
  
  // 第二遍：构建父子关系
  result.rows.forEach((row: any) => {
    const region = regionMap.get(row.code)!
    if (row.parent_code) {
      const parent = regionMap.get(row.parent_code)
      if (parent) {
        parent.children.push(region)
      }
    } else {
      rootRegions.push(region)
    }
  })
  
  return rootRegions
}

// 首页数据 - 从配置表读取组件配置，然后从 products 表动态生成
export async function getHomePageData(): Promise<HomePageData> {
  const pool = getPool()
  // 从配置表获取启用的组件配置，按 sort_order 排序
  const componentsConfig = await pool.query(`
    SELECT id, type, title, config, sort_order
    FROM homepage_components
    WHERE is_enabled = TRUE
    ORDER BY sort_order ASC, create_time ASC
  `)
  
  const mapProduct = (row: any): Product => ({
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
    tag: row.tag,
    category: row.category,
    subCategory: row.sub_category,
    brand: row.brand,
    images: row.images ? JSON.parse(row.images) : undefined,
    detailDescription: row.detail_description,
    highlights: row.highlights ? JSON.parse(row.highlights) : undefined,
    specs: row.specs ? JSON.parse(row.specs) : undefined,
    reviews: row.reviews ? JSON.parse(row.reviews) : undefined,
    services: row.services ? JSON.parse(row.services) : undefined,
    shippingInfo: row.shipping_info,
    stock: row.stock
  })
  
  const components: PageComponent[] = []
  
  // 遍历配置，为每个组件查询商品数据
  for (const config of componentsConfig.rows) {
    const componentConfig = config.config ? JSON.parse(config.config) : {}
    const componentType = config.type
    const componentId = config.id
    const componentTitle = config.title || ''
    
    let productsQuery = ''
    let queryParams: any[] = []
    
    // 根据组件类型和配置生成查询
    switch (componentType) {
      case 'carousel':
        // 轮播图：根据 tag 查询
        const carouselTag = componentConfig.tag || ''
        const carouselLimit = componentConfig.limit || 5
        if (carouselTag) {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [carouselTag, carouselLimit]
        } else {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag IS NOT NULL AND tag != ''
            ORDER BY create_time DESC
            LIMIT $1
          `
          queryParams = [carouselLimit]
        }
        break
        
      case 'seckill':
        // 秒杀：查询 tag = 'seckill' 的商品（统一后的标准 tag）
        const seckillLimit = componentConfig.limit || 10
        const seckillTag = componentConfig.tag // 允许通过配置指定 tag
        if (seckillTag) {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [seckillTag, seckillLimit]
        } else {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = 'seckill'
            ORDER BY create_time DESC
            LIMIT $1
          `
          queryParams = [seckillLimit]
        }
        break
        
      case 'groupbuy':
        // 团购：查询 tag = 'groupbuy' 的商品（统一后的标准 tag）
        const groupbuyLimit = componentConfig.limit || 10
        const groupbuyTag = componentConfig.tag // 允许通过配置指定 tag
        if (groupbuyTag) {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [groupbuyTag, groupbuyLimit]
        } else {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = 'groupbuy'
            ORDER BY create_time DESC
            LIMIT $1
          `
          queryParams = [groupbuyLimit]
        }
        break
        
      case 'productList':
        // 商品列表：根据分类或标签查询
        const productListLimit = componentConfig.limit || 20
        const productListCategory = componentConfig.category
        const productListTag = componentConfig.tag
        
        if (productListCategory) {
          productsQuery = `
            SELECT * FROM products 
            WHERE category = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [productListCategory, productListLimit]
        } else if (productListTag) {
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [productListTag, productListLimit]
        } else {
          productsQuery = `
            SELECT * FROM products 
            ORDER BY create_time DESC
            LIMIT $1
          `
          queryParams = [productListLimit]
        }
        break
        
      case 'guessYouLike':
        // 猜你喜欢：随机或按时间排序
        const guessLimit = componentConfig.limit || 20
        productsQuery = `
          SELECT * FROM products 
          ORDER BY create_time DESC
          LIMIT $1
        `
        queryParams = [guessLimit]
        break
        
      default:
        console.warn(`未知的组件类型: ${componentType}`)
        continue
    }
    
    // 执行查询
    const productsResult = await pool.query(productsQuery, queryParams)
    
    // 即使没有商品，也返回组件（前端可以显示空状态）
    // 但为了兼容性，如果查询结果为空，记录警告并跳过
    if (productsResult.rows.length === 0) {
      console.warn(`组件 ${componentId} (${componentType}) 查询不到商品数据，跳过该组件`)
      continue
    }
    
    // 根据组件类型构建数据
    if (componentType === 'carousel') {
      components.push({
        type: 'carousel',
        id: componentId,
        config: {
          title: componentTitle
        },
        data: productsResult.rows.map((row: any) => ({
          id: row.id,
          image: row.image,
          title: row.name,
          link: `/product/${row.id}`
        }))
      })
    } else {
      components.push({
        type: componentType as any,
        id: componentId,
        config: {
          title: componentTitle,
          ...componentConfig
        },
        data: productsResult.rows.map(mapProduct)
      })
    }
  }
  
  return { components }
}

