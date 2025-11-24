import { Pool, QueryResult } from 'pg'
import { User } from '../types/user'
import { Address, Order, OrderItem } from '../types/address'
import { Product, Category, HomePageData, PageComponent } from '../types/product'
import { Image } from '../types/image'
import { Page, PageQueryParams, PageListResponse, CreatePageData, UpdatePageData, LastOperationType } from '../types/page'
import { DataSourceItem, DataSourceQueryParams, DataSourceListResponse, CreateDataSourceData, UpdateDataSourceData, DataSourceType } from '../types/datasource'

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
    connectionTimeoutMillis: 10000, // 增加连接超时时间到 10 秒
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

// 查询商品（支持多条件查询和分页）
export interface ProductQueryOptions {
  name?: string
  category?: string
  subCategory?: string
  brand?: string
  tag?: string
  minPrice?: number
  maxPrice?: number
  stock?: number
  page?: number
  pageSize?: number
}

export interface ProductQueryResult {
  products: Product[]
  total: number
  page: number
  pageSize: number
}

export async function queryProducts(options: ProductQueryOptions = {}): Promise<ProductQueryResult> {
  const {
    name,
    category,
    subCategory,
    brand,
    tag,
    minPrice,
    maxPrice,
    stock,
    page = 1,
    pageSize = 10
  } = options

  // 构建 WHERE 条件
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (name) {
    conditions.push(`name ILIKE $${paramIndex++}`)
    params.push(`%${name}%`)
  }
  if (category) {
    conditions.push(`category = $${paramIndex++}`)
    params.push(category)
  }
  if (subCategory) {
    conditions.push(`sub_category ILIKE $${paramIndex++}`)
    params.push(`%${subCategory}%`)
  }
  if (brand) {
    conditions.push(`brand ILIKE $${paramIndex++}`)
    params.push(`%${brand}%`)
  }
  if (tag) {
    conditions.push(`tag ILIKE $${paramIndex++}`)
    params.push(`%${tag}%`)
  }
  if (minPrice !== undefined) {
    conditions.push(`price >= $${paramIndex++}`)
    params.push(minPrice)
  }
  if (maxPrice !== undefined) {
    conditions.push(`price <= $${paramIndex++}`)
    params.push(maxPrice)
  }
  if (stock !== undefined && stock !== null) {
    conditions.push(`stock >= $${paramIndex++}`)
    params.push(stock)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 查询总数
  const countQuery = `SELECT COUNT(*) as total FROM products ${whereClause}`
  const countResult = await getPool().query(countQuery, params)
  const total = parseInt(countResult.rows[0].total)

  // 查询数据（带分页）
  const offset = (page - 1) * pageSize
  const dataQuery = `
    SELECT * FROM products 
    ${whereClause}
    ORDER BY create_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  const dataParams = [...params, pageSize, offset]
  const dataResult = await getPool().query(dataQuery, dataParams)

  const products = dataResult.rows.map((row: any) => ({
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

  return {
    products,
    total,
    page,
    pageSize
  }
}

// 更新商品
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (updates.name !== undefined) {
    updatesList.push(`name = $${paramIndex++}`)
    values.push(updates.name)
  }
    if (updates.description !== undefined) {
      updatesList.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.image !== undefined) {
      updatesList.push(`image = $${paramIndex++}`)
      values.push(updates.image)
    }
    if (updates.price !== undefined) {
      updatesList.push(`price = $${paramIndex++}`)
      values.push(updates.price)
    }
    if (updates.originalPrice !== undefined) {
      updatesList.push(`original_price = $${paramIndex++}`)
      values.push(updates.originalPrice)
    }
    if (updates.tag !== undefined) {
      updatesList.push(`tag = $${paramIndex++}`)
      values.push(updates.tag)
    }
    if (updates.category !== undefined) {
      updatesList.push(`category = $${paramIndex++}`)
      values.push(updates.category)
    }
    if (updates.subCategory !== undefined) {
      updatesList.push(`sub_category = $${paramIndex++}`)
      values.push(updates.subCategory)
    }
    if (updates.brand !== undefined) {
      updatesList.push(`brand = $${paramIndex++}`)
      values.push(updates.brand)
    }
    if (updates.images !== undefined) {
      updatesList.push(`images = $${paramIndex++}`)
      values.push(JSON.stringify(updates.images))
    }
    if (updates.detailDescription !== undefined) {
      updatesList.push(`detail_description = $${paramIndex++}`)
      values.push(updates.detailDescription)
    }
    if (updates.highlights !== undefined) {
      updatesList.push(`highlights = $${paramIndex++}`)
      values.push(JSON.stringify(updates.highlights))
    }
    if (updates.specs !== undefined) {
      updatesList.push(`specs = $${paramIndex++}`)
      values.push(JSON.stringify(updates.specs))
    }
    if (updates.reviews !== undefined) {
      updatesList.push(`reviews = $${paramIndex++}`)
      values.push(JSON.stringify(updates.reviews))
    }
    if (updates.services !== undefined) {
      updatesList.push(`services = $${paramIndex++}`)
      values.push(JSON.stringify(updates.services))
    }
    if (updates.shippingInfo !== undefined) {
      updatesList.push(`shipping_info = $${paramIndex++}`)
      values.push(updates.shippingInfo)
    }
    if (updates.stock !== undefined) {
      updatesList.push(`stock = $${paramIndex++}`)
      values.push(updates.stock)
    }

    if (updatesList.length === 0) {
      // 没有要更新的字段，直接返回原商品
      return await getProductById(id)
    }

    // 添加更新时间
    updatesList.push(`update_time = CURRENT_TIMESTAMP`)
    
    // 添加 id 参数
    const idParamIndex = paramIndex
    values.push(id)
    
    const query = `
      UPDATE products
      SET ${updatesList.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
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
  } catch (error) {
    console.error('Database updateProduct error:', error)
    throw error
  }
}

// 新增商品
export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  try {
    // 如果没有提供 ID，生成一个（使用时间戳 + 随机数）
    const id = product.id || `product_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const query = `
      INSERT INTO products (
        id, name, description, image, price, original_price, tag, 
        category, sub_category, brand, images, detail_description, 
        highlights, specs, reviews, services, shipping_info, stock,
        create_time, update_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
    
    const values = [
      id,
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
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create product')
    }
    
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
  } catch (error) {
    console.error('Database addProduct error:', error)
    throw error
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
        // 秒杀：查询包含秒杀相关 tag 的商品
        // 支持配置 tag，如果没有配置则使用 LIKE 匹配 '限时' 或 '秒杀' 相关的 tag
        const seckillLimit = componentConfig.limit || 10
        const seckillTag = componentConfig.tag // 允许通过配置指定 tag
        if (seckillTag) {
          // 如果配置了 tag，精确匹配
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [seckillTag, seckillLimit]
        } else {
          // 如果没有配置 tag，使用 LIKE 匹配包含 '限时' 或 '秒杀' 的 tag
          productsQuery = `
            SELECT * FROM products 
            WHERE tag LIKE '%限时%' OR tag LIKE '%秒杀%' OR tag = 'seckill'
            ORDER BY create_time DESC
            LIMIT $1
          `
          queryParams = [seckillLimit]
        }
        break
        
      case 'groupbuy':
        // 团购：查询包含团购相关 tag 的商品
        // 支持配置 tag，如果没有配置则使用 LIKE 匹配 '团购' 相关的 tag
        const groupbuyLimit = componentConfig.limit || 10
        const groupbuyTag = componentConfig.tag // 允许通过配置指定 tag
        if (groupbuyTag) {
          // 如果配置了 tag，精确匹配
          productsQuery = `
            SELECT * FROM products 
            WHERE tag = $1
            ORDER BY create_time DESC
            LIMIT $2
          `
          queryParams = [groupbuyTag, groupbuyLimit]
        } else {
          // 如果没有配置 tag，使用 LIKE 匹配包含 '团购' 的 tag
          productsQuery = `
            SELECT * FROM products 
            WHERE tag LIKE '%团购%' OR tag = 'groupbuy'
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
    } else if (componentType === 'seckill') {
      // 秒杀组件需要特殊格式：{ endTime, products }
      // 确保 endTime 是有效的 ISO 字符串
      let endTime: string
      if (componentConfig.endTime) {
        // 如果配置中有 endTime，验证格式
        const endTimeDate = new Date(componentConfig.endTime)
        if (isNaN(endTimeDate.getTime())) {
          // 无效日期，使用默认值
          endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        } else {
          endTime = endTimeDate.toISOString()
        }
      } else {
        // 默认24小时后结束
        endTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      
      const products = productsResult.rows.map(mapProduct).filter(p => p !== null && p !== undefined)
      
      components.push({
        type: 'seckill',
        id: componentId,
        config: {
          title: componentTitle,
          ...componentConfig
        },
        data: {
          endTime: endTime,
          products: products
        }
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

// ==================== 图片相关 ====================

// 查询图片列表（支持多参数过滤和分页）
export async function queryImages(
  params: {
    name?: string
    category?: string
    tags?: string
    format?: string
    minWidth?: number
    maxWidth?: number
    minHeight?: number
    maxHeight?: number
    minSize?: number
    maxSize?: number
    startTime?: string
    endTime?: string
    page?: number
    pageSize?: number
  } = {}
): Promise<{ images: Image[]; total: number; page: number; pageSize: number }> {
  const pool = getPool()
  const { 
    name, category, tags, format, 
    minWidth, maxWidth, minHeight, maxHeight,
    minSize, maxSize, startTime, endTime,
    page = 1, pageSize = 10 
  } = params
  
  // 构建 WHERE 条件
  const conditions: string[] = []
  const values: any[] = []
  let paramIndex = 1
  
  if (name) {
    conditions.push(`name ILIKE $${paramIndex++}`)
    values.push(`%${name}%`)
  }
  
  if (category) {
    conditions.push(`category = $${paramIndex++}`)
    values.push(category)
  }
  
  if (tags) {
    conditions.push(`tags ILIKE $${paramIndex++}`)
    values.push(`%${tags}%`)
  }
  
  if (format) {
    conditions.push(`format = $${paramIndex++}`)
    values.push(format.toLowerCase())
  }
  
  if (minWidth !== undefined) {
    conditions.push(`width >= $${paramIndex++}`)
    values.push(minWidth)
  }
  
  if (maxWidth !== undefined) {
    conditions.push(`width <= $${paramIndex++}`)
    values.push(maxWidth)
  }
  
  if (minHeight !== undefined) {
    conditions.push(`height >= $${paramIndex++}`)
    values.push(minHeight)
  }
  
  if (maxHeight !== undefined) {
    conditions.push(`height <= $${paramIndex++}`)
    values.push(maxHeight)
  }
  
  if (minSize !== undefined) {
    conditions.push(`size >= $${paramIndex++}`)
    values.push(minSize)
  }
  
  if (maxSize !== undefined) {
    conditions.push(`size <= $${paramIndex++}`)
    values.push(maxSize)
  }
  
  if (startTime) {
    conditions.push(`upload_time >= $${paramIndex++}`)
    values.push(startTime)
  }
  
  if (endTime) {
    conditions.push(`upload_time <= $${paramIndex++}::date + INTERVAL '1 day'`)
    values.push(endTime)
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
  
  // 查询总数
  const countQuery = `SELECT COUNT(*) as total FROM images ${whereClause}`
  const countResult = await pool.query(countQuery, values)
  const total = parseInt(countResult.rows[0].total, 10)
  
  // 查询数据（支持分页）
  const offset = (page - 1) * pageSize
  const dataQuery = `
    SELECT * FROM images 
    ${whereClause}
    ORDER BY upload_time DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `
  const dataValues = [...values, pageSize, offset]
  const dataResult = await pool.query(dataQuery, dataValues)
  
  const images = dataResult.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    category: row.category,
    tags: row.tags,
    width: row.width,
    height: row.height,
    size: row.size,
    format: row.format,
    uploadTime: row.upload_time ? new Date(row.upload_time).toISOString() : undefined,
    updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
  }))
  
  return {
    images,
    total,
    page,
    pageSize
  }
}

// 根据 ID 获取图片
export async function getImageById(id: string): Promise<Image | null> {
  const result = await getPool().query('SELECT * FROM images WHERE id = $1', [id])
  if (result.rows.length === 0) {
    return null
  }
  
  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    description: row.description,
    category: row.category,
    tags: row.tags,
    width: row.width,
    height: row.height,
    size: row.size,
    format: row.format,
    uploadTime: row.upload_time ? new Date(row.upload_time).toISOString() : undefined,
    updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
  }
}

// 更新图片
export async function updateImage(id: string, updates: Partial<Image>): Promise<Image | null> {
  try {
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (updates.name !== undefined) {
      updatesList.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    if (updates.url !== undefined) {
      updatesList.push(`url = $${paramIndex++}`)
      values.push(updates.url)
    }
    if (updates.description !== undefined) {
      updatesList.push(`description = $${paramIndex++}`)
      values.push(updates.description)
    }
    if (updates.category !== undefined) {
      updatesList.push(`category = $${paramIndex++}`)
      values.push(updates.category)
    }
    if (updates.tags !== undefined) {
      updatesList.push(`tags = $${paramIndex++}`)
      values.push(updates.tags)
    }
    if (updates.width !== undefined) {
      updatesList.push(`width = $${paramIndex++}`)
      values.push(updates.width)
    }
    if (updates.height !== undefined) {
      updatesList.push(`height = $${paramIndex++}`)
      values.push(updates.height)
    }
    if (updates.size !== undefined) {
      updatesList.push(`size = $${paramIndex++}`)
      values.push(updates.size)
    }
    if (updates.format !== undefined) {
      updatesList.push(`format = $${paramIndex++}`)
      values.push(updates.format)
    }
    
    if (updatesList.length === 0) {
      return await getImageById(id)
    }
    
    updatesList.push(`update_time = CURRENT_TIMESTAMP`)
    const idParamIndex = paramIndex
    values.push(id)
    
    const query = `
      UPDATE images
      SET ${updatesList.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      description: row.description,
      category: row.category,
      tags: row.tags,
      width: row.width,
      height: row.height,
      size: row.size,
      format: row.format,
      uploadTime: row.upload_time ? new Date(row.upload_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }
  } catch (error) {
    console.error('Database updateImage error:', error)
    throw error
  }
}

// 新增图片
export async function addImage(image: Omit<Image, 'id'> & { id?: string }): Promise<Image> {
  try {
    // 如果没有提供 ID，生成一个（使用时间戳 + 随机数）
    const id = image.id || `image_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const query = `
      INSERT INTO images (
        id, name, url, description, category, tags, width, height, size, format,
        upload_time, update_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
    
    const values = [
      id,
      image.name,
      image.url,
      image.description || null,
      image.category || null,
      image.tags || null,
      image.width || null,
      image.height || null,
      image.size || null,
      image.format || null
    ]
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create image')
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      url: row.url,
      description: row.description,
      category: row.category,
      tags: row.tags,
      width: row.width,
      height: row.height,
      size: row.size,
      format: row.format,
      uploadTime: row.upload_time ? new Date(row.upload_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }
  } catch (error) {
    console.error('Database addImage error:', error)
    throw error
  }
}

// 删除图片
export async function deleteImage(id: string): Promise<boolean> {
  try {
    const query = 'DELETE FROM images WHERE id = $1'
    const result = await getPool().query(query, [id])
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Database deleteImage error:', error)
    throw error
  }
}

// ==================== 页面相关操作 ====================

// 查询页面列表
export async function queryPages(params: PageQueryParams = {}): Promise<PageListResponse> {
  try {
    const { name, pageType, isPublished, page = 1, pageSize = 10 } = params
    
    let whereConditions: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (name) {
      whereConditions.push(`name LIKE $${paramIndex++}`)
      values.push(`%${name}%`)
    }
    
    if (pageType) {
      whereConditions.push(`page_type = $${paramIndex++}`)
      values.push(pageType)
    }
    
    if (isPublished !== undefined) {
      whereConditions.push(`is_published = $${paramIndex++}`)
      values.push(isPublished)
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    
    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM pages ${whereClause}`
    const countResult = await getPool().query(countQuery, values)
    const total = parseInt(countResult.rows[0].total, 10)
    
    // 查询数据
    const offset = (page - 1) * pageSize
    const dataValues = [...values, pageSize, offset]
    const dataQuery = `
      SELECT * FROM pages
      ${whereClause}
      ORDER BY create_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const dataResult = await getPool().query(dataQuery, dataValues)
    
    const pages: Page[] = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      pageType: row.page_type,
      dataSource: row.data_source,
      isPublished: row.is_published,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
      lastOperationType: row.last_operation_type
    }))
    
    return {
      pages,
      total,
      page,
      pageSize
    }
  } catch (error) {
    console.error('Database queryPages error:', error)
    throw error
  }
}

// 根据ID获取页面
export async function getPageById(id: string): Promise<Page | null> {
  try {
    const query = 'SELECT * FROM pages WHERE id = $1'
    const result = await getPool().query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      pageType: row.page_type,
      dataSource: row.data_source,
      isPublished: row.is_published,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
      lastOperationType: row.last_operation_type
    }
  } catch (error) {
    console.error('Database getPageById error:', error)
    throw error
  }
}

// 创建页面
export async function createPage(pageData: CreatePageData): Promise<Page> {
  try {
    const id = `page_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const query = `
      INSERT INTO pages (
        id, name, page_type, data_source, is_published, create_time
      ) VALUES (
        $1, $2, $3, NULL, FALSE, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
    
    const values = [
      id,
      pageData.name,
      pageData.pageType
    ]
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create page')
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      pageType: row.page_type,
      dataSource: row.data_source,
      isPublished: row.is_published,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
      lastOperationType: row.last_operation_type
    }
  } catch (error) {
    console.error('Database createPage error:', error)
    throw error
  }
}

// 更新页面（编辑操作）
export async function updatePage(id: string, updates: UpdatePageData, operationType: LastOperationType = 'edit'): Promise<Page | null> {
  try {
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (updates.name !== undefined) {
      updatesList.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    
    if (updates.pageType !== undefined) {
      updatesList.push(`page_type = $${paramIndex++}`)
      values.push(updates.pageType)
    }
    
    // 更新最近操作时间和操作类型
    updatesList.push(`last_operation_time = CURRENT_TIMESTAMP`)
    updatesList.push(`last_operation_type = $${paramIndex++}`)
    values.push(operationType)
    
    if (updatesList.length === 0) {
      return await getPageById(id)
    }
    
    const idParamIndex = paramIndex
    values.push(id)
    
    const query = `
      UPDATE pages
      SET ${updatesList.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      pageType: row.page_type,
      dataSource: row.data_source,
      isPublished: row.is_published,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
      lastOperationType: row.last_operation_type
    }
  } catch (error) {
    console.error('Database updatePage error:', error)
    throw error
  }
}

// 发布页面（将当前页面设为已发布，其他所有页面设为未发布）
export async function publishPage(id: string): Promise<Page | null> {
  try {
    const pool = getPool()
    
    // 开始事务：先将所有页面设为未发布，然后将指定页面设为已发布
    await pool.query('BEGIN')
    
    try {
      // 将所有页面设为未发布
      await pool.query('UPDATE pages SET is_published = FALSE')
      
      // 将指定页面设为已发布，并更新最近操作时间和操作类型
      const query = `
        UPDATE pages
        SET is_published = TRUE,
            last_operation_time = CURRENT_TIMESTAMP,
            last_operation_type = 'publish'
        WHERE id = $1
        RETURNING *
      `
      
      const result = await pool.query(query, [id])
      
      if (result.rows.length === 0) {
        await pool.query('ROLLBACK')
        return null
      }
      
      await pool.query('COMMIT')
      
      const row = result.rows[0]
      return {
        id: row.id,
        name: row.name,
        pageType: row.page_type,
        dataSource: row.data_source,
        isPublished: row.is_published,
        createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
        lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
        lastOperationType: row.last_operation_type
      }
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error('Database publishPage error:', error)
    throw error
  }
}

// 运营操作（更新最近操作时间和操作类型为operate）
export async function operatePage(id: string): Promise<Page | null> {
  try {
    const query = `
      UPDATE pages
      SET last_operation_time = CURRENT_TIMESTAMP,
          last_operation_type = 'operate'
      WHERE id = $1
      RETURNING *
    `
    
    const result = await getPool().query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      pageType: row.page_type,
      dataSource: row.data_source,
      isPublished: row.is_published,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      lastOperationTime: row.last_operation_time ? new Date(row.last_operation_time).toISOString() : undefined,
      lastOperationType: row.last_operation_type
    }
  } catch (error) {
    console.error('Database operatePage error:', error)
    throw error
  }
}

// 删除页面
export async function deletePage(id: string): Promise<boolean> {
  try {
    const query = 'DELETE FROM pages WHERE id = $1'
    const result = await getPool().query(query, [id])
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error('Database deletePage error:', error)
    throw error
  }
}

// ==================== 数据源相关操作 ====================

// 获取表名
function getTableName(type: DataSourceType): string {
  const tableMap: Record<DataSourceType, string> = {
    carousel: 'carousel_items',
    seckill: 'seckill_items',
    groupbuy: 'groupbuy_items',
    productList: 'product_list_items',
    guessYouLike: 'guess_you_like_items'
  }
  return tableMap[type]
}

// 查询数据源列表
export async function queryDataSourceItems(
  type: DataSourceType,
  params: DataSourceQueryParams = {}
): Promise<DataSourceListResponse> {
  try {
    const { id, name, isEnabled, page = 1, pageSize = 10 } = params
    const tableName = getTableName(type)
    
    let whereConditions: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (id) {
      whereConditions.push(`id = $${paramIndex++}`)
      values.push(id)
    }
    
    if (name) {
      whereConditions.push(`name LIKE $${paramIndex++}`)
      values.push(`%${name}%`)
    }
    
    if (isEnabled !== undefined) {
      whereConditions.push(`is_enabled = $${paramIndex++}`)
      values.push(isEnabled)
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
    
    // 查询总数
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`
    const countResult = await getPool().query(countQuery, values)
    const total = parseInt(countResult.rows[0].total, 10)
    
    // 查询数据
    const offset = (page - 1) * pageSize
    const dataValues = [...values, pageSize, offset]
    const dataQuery = `
      SELECT * FROM ${tableName}
      ${whereClause}
      ORDER BY sort_order ASC, create_time DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    
    const dataResult = await getPool().query(dataQuery, dataValues)
    
    const items: DataSourceItem[] = dataResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      config: row.config,
      data: row.data,
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }))
    
    return {
      items,
      total,
      page,
      pageSize
    }
  } catch (error) {
    console.error(`Database queryDataSourceItems error (${type}):`, error)
    throw error
  }
}

// 根据ID获取数据源项
export async function getDataSourceItemById(
  type: DataSourceType,
  id: string
): Promise<DataSourceItem | null> {
  try {
    const tableName = getTableName(type)
    const query = `SELECT * FROM ${tableName} WHERE id = $1`
    const result = await getPool().query(query, [id])
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      config: row.config,
      data: row.data,
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }
  } catch (error) {
    console.error(`Database getDataSourceItemById error (${type}):`, error)
    throw error
  }
}

// 创建数据源项
export async function createDataSourceItem(
  type: DataSourceType,
  itemData: CreateDataSourceData
): Promise<DataSourceItem> {
  try {
    const tableName = getTableName(type)
    
    // 生成ID：abbreviation + 随机数字，总长度不超过10位
    // 如果abbreviation是2位，则随机数字最多8位
    const abbreviation = itemData.abbreviation.toUpperCase()
    const maxRandomLength = 10 - abbreviation.length
    const randomNum = Math.floor(Math.random() * Math.pow(10, maxRandomLength))
    const id = `${abbreviation}${randomNum.toString().padStart(maxRandomLength, '0')}`
    
    const query = `
      INSERT INTO ${tableName} (
        id, name, config, data, sort_order, is_enabled, create_time, update_time
      ) VALUES (
        $1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      RETURNING *
    `
    
    const values = [
      id,
      itemData.name,
      itemData.config || null,
      itemData.data,
      itemData.sortOrder ?? 0,
      itemData.isEnabled ?? true
    ]
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      throw new Error('Failed to create data source item')
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      config: row.config,
      data: row.data,
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }
  } catch (error) {
    console.error(`Database createDataSourceItem error (${type}):`, error)
    throw error
  }
}

// 更新数据源项
export async function updateDataSourceItem(
  type: DataSourceType,
  id: string,
  updates: UpdateDataSourceData
): Promise<DataSourceItem | null> {
  try {
    const tableName = getTableName(type)
    const updatesList: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (updates.name !== undefined) {
      updatesList.push(`name = $${paramIndex++}`)
      values.push(updates.name)
    }
    
    if (updates.config !== undefined) {
      updatesList.push(`config = $${paramIndex++}`)
      values.push(updates.config)
    }
    
    if (updates.data !== undefined) {
      updatesList.push(`data = $${paramIndex++}`)
      values.push(updates.data)
    }
    
    if (updates.sortOrder !== undefined) {
      updatesList.push(`sort_order = $${paramIndex++}`)
      values.push(updates.sortOrder)
    }
    
    if (updates.isEnabled !== undefined) {
      updatesList.push(`is_enabled = $${paramIndex++}`)
      values.push(updates.isEnabled)
    }
    
    if (updatesList.length === 0) {
      return await getDataSourceItemById(type, id)
    }
    
    updatesList.push(`update_time = CURRENT_TIMESTAMP`)
    const idParamIndex = paramIndex
    values.push(id)
    
    const query = `
      UPDATE ${tableName}
      SET ${updatesList.join(', ')}
      WHERE id = $${idParamIndex}
      RETURNING *
    `
    
    const result = await getPool().query(query, values)
    
    if (result.rows.length === 0) {
      return null
    }
    
    const row = result.rows[0]
    return {
      id: row.id,
      name: row.name,
      config: row.config,
      data: row.data,
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time ? new Date(row.create_time).toISOString() : undefined,
      updateTime: row.update_time ? new Date(row.update_time).toISOString() : undefined
    }
  } catch (error) {
    console.error(`Database updateDataSourceItem error (${type}):`, error)
    throw error
  }
}

// 删除数据源项
export async function deleteDataSourceItem(
  type: DataSourceType,
  id: string
): Promise<boolean> {
  try {
    const tableName = getTableName(type)
    const query = `DELETE FROM ${tableName} WHERE id = $1`
    const result = await getPool().query(query, [id])
    return (result.rowCount ?? 0) > 0
  } catch (error) {
    console.error(`Database deleteDataSourceItem error (${type}):`, error)
    throw error
  }
}

