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
  // 获取所有一级分类
  const mainCategoriesResult = await getPool().query(`
    SELECT id, name, code, sort_order
    FROM categories
    WHERE parent_id IS NULL
    ORDER BY sort_order, name
  `)
  
  const categories: Category[] = []
  
  for (const mainCat of mainCategoriesResult.rows) {
    // 获取子分类
    const subCategoriesResult = await getPool().query(`
      SELECT id, name, code, sort_order
      FROM categories
      WHERE parent_id = $1
      ORDER BY sort_order, name
    `, [mainCat.id])
    
    const subCategories = []
    
    for (const subCat of subCategoriesResult.rows) {
      // 获取该子分类下的商品
      const productsResult = await getPool().query(`
        SELECT * FROM products
        WHERE sub_category = $1 OR category = $2
        ORDER BY create_time DESC
        LIMIT 50
      `, [subCat.id, mainCat.id])
      
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
      icon: '', // 分类表没有 icon 字段，可以后续添加或从配置获取
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

// 首页数据 - 从 products 表动态生成
export async function getHomePageData(): Promise<HomePageData> {
  // 获取轮播图商品（带 tag 的商品）
  const carouselProducts = await getPool().query(`
    SELECT * FROM products 
    WHERE tag IS NOT NULL AND tag != ''
    ORDER BY create_time DESC
    LIMIT 5
  `)
  
  // 获取秒杀商品
  const seckillProducts = await getPool().query(`
    SELECT * FROM products 
    WHERE tag = 'seckill' OR tag LIKE '%秒杀%'
    ORDER BY create_time DESC
    LIMIT 10
  `)
  
  // 获取团购商品
  const groupbuyProducts = await getPool().query(`
    SELECT * FROM products 
    WHERE tag = 'groupbuy' OR tag LIKE '%团购%'
    ORDER BY create_time DESC
    LIMIT 10
  `)
  
  // 获取猜你喜欢商品
  const guessYouLikeProducts = await getPool().query(`
    SELECT * FROM products 
    ORDER BY create_time DESC
    LIMIT 20
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
  
  // 轮播图组件
  if (carouselProducts.rows.length > 0) {
    components.push({
      type: 'carousel',
      id: 'carousel-1',
      config: {
        title: '热门推荐'
      },
      data: carouselProducts.rows.map((row: any) => ({
        id: row.id,
        image: row.image,
        title: row.name,
        link: `/product/${row.id}`
      }))
    })
  }
  
  // 秒杀组件
  if (seckillProducts.rows.length > 0) {
    components.push({
      type: 'seckill',
      id: 'seckill-1',
      config: {
        title: '限时秒杀'
      },
      data: seckillProducts.rows.map(mapProduct)
    })
  }
  
  // 团购组件
  if (groupbuyProducts.rows.length > 0) {
    components.push({
      type: 'groupbuy',
      id: 'groupbuy-1',
      config: {
        title: '团购优惠'
      },
      data: groupbuyProducts.rows.map(mapProduct)
    })
  }
  
  // 商品列表组件
  const allProducts = await getPool().query(`
    SELECT * FROM products 
    ORDER BY create_time DESC
    LIMIT 20
  `)
  
  if (allProducts.rows.length > 0) {
    components.push({
      type: 'productList',
      id: 'product-list-1',
      config: {
        title: '精选商品'
      },
      data: allProducts.rows.map(mapProduct)
    })
  }
  
  // 猜你喜欢组件
  if (guessYouLikeProducts.rows.length > 0) {
    components.push({
      type: 'guessYouLike',
      id: 'guess-you-like-1',
      config: {
        title: '猜你喜欢'
      },
      data: guessYouLikeProducts.rows.map(mapProduct)
    })
  }
  
  return { components }
}

