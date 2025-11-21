// 数据库适配器 - 统一接口，支持 JSON 文件和 PostgreSQL 数据库
import { User } from '../types/user'
import { Address, Order } from '../types/address'
import { Product, Category, HomePageData } from '../types/product'
import * as fs from 'fs'
import * as path from 'path'
import { initDatabase, getPool } from './pg-db'

const USE_DATABASE = process.env.USE_DATABASE === 'true'

// 如果使用数据库，初始化连接
if (USE_DATABASE) {
  initDatabase()
}

const DATA_DIR = path.join(__dirname, '../../data')
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json')
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json')
const HOMEPAGE_FILE = path.join(DATA_DIR, 'homepage.json')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const ADDRESSES_FILE = path.join(DATA_DIR, 'addresses.json')
const REGIONS_FILE = path.join(DATA_DIR, 'regions.json')
const USERS_FILE = path.join(DATA_DIR, 'users.json')

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// 读取 JSON 文件
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error)
  }
  return defaultValue
}

// 写入 JSON 文件
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error)
    throw error
  }
}

// 从数据库模型转换为应用模型
function dbUserToUser(row: any): User {
  return {
    id: row.id,
    username: row.username,
    phone: row.phone,
    email: row.email,
    password: row.password,
    createTime: row.create_time instanceof Date ? row.create_time.toISOString() : row.create_time,
    updateTime: row.update_time instanceof Date ? row.update_time.toISOString() : row.update_time
  }
}

function dbAddressToAddress(row: any): Address {
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

export class Database {
  // 用户相关
  static async getUsers(): Promise<User[]> {
    if (USE_DATABASE) {
      const result = await getPool().query(
        'SELECT id, username, phone, email, password, create_time, update_time FROM users'
      )
      return result.rows.map(dbUserToUser)
    }
    return readJsonFile<User[]>(USERS_FILE, [])
  }

  static async getUserById(id: string): Promise<User | null> {
    if (USE_DATABASE) {
      const result = await getPool().query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      )
      if (result.rows.length === 0) return null
      return dbUserToUser(result.rows[0])
    }
    const users = this.getUsers()
    const user = (await users).find(u => u.id === id)
    return user || null
  }

  static async getUserByPhone(phone: string): Promise<User | null> {
    if (USE_DATABASE) {
      const result = await getPool().query(
        'SELECT * FROM users WHERE phone = $1',
        [phone]
      )
      if (result.rows.length === 0) return null
      return dbUserToUser(result.rows[0])
    }
    const users = await this.getUsers()
    return users.find(u => u.phone === phone) || null
  }

  static async addUser(user: User): Promise<void> {
    if (USE_DATABASE) {
      await getPool().query(
        `INSERT INTO users (id, username, phone, email, password, create_time, update_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
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
      return
    }
    const users = await this.getUsers()
    users.push(user)
    writeJsonFile(USERS_FILE, users)
  }

  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    if (USE_DATABASE) {
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

      if (fields.length === 0) {
        return await this.getUserById(id)
      }

      fields.push(`update_time = CURRENT_TIMESTAMP`)
      values.push(id)

      await getPool().query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
        values
      )
      return await this.getUserById(id)
    }
    const users = await this.getUsers()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return null
    users[index] = { ...users[index], ...updates, updateTime: new Date().toISOString() }
    writeJsonFile(USERS_FILE, users)
    return users[index]
  }

  // 异步方法别名（供服务层使用）
  static async getUserByPhoneAsync(phone: string): Promise<User | null> {
    return this.getUserByPhone(phone)
  }

  static async getUserByIdAsync(id: string): Promise<User | null> {
    return this.getUserById(id)
  }

  static async addUserAsync(user: User): Promise<void> {
    return this.addUser(user)
  }

  // 地址相关 - 同步方法（兼容现有代码）
  static getAddresses(userId?: string): Address[] {
    if (USE_DATABASE) {
      console.warn('getAddresses() 在数据库模式下应使用异步方法')
      return []
    }
    const addresses = readJsonFile<Address[]>(ADDRESSES_FILE, [])
    if (userId) {
      return addresses.filter(a => a.userId === userId)
    }
    return addresses
  }

  static getAddressById(id: string, userId?: string): Address | null {
    if (USE_DATABASE) {
      console.warn('getAddressById() 在数据库模式下应使用异步方法')
      return null
    }
    const addresses = this.getAddresses(userId)
    return addresses.find(a => a.id === id) || null
  }

  static addAddress(address: Address): void {
    if (USE_DATABASE) {
      console.warn('addAddress() 在数据库模式下应使用异步方法')
      return
    }
    const addresses = this.getAddresses()
    addresses.push(address)
    this.saveAddresses(addresses)
  }

  static updateAddress(id: string, updates: Partial<Address>, userId?: string): Address | null {
    if (USE_DATABASE) {
      console.warn('updateAddress() 在数据库模式下应使用异步方法')
      return null
    }
    const addresses = this.getAddresses()
    const index = addresses.findIndex(a => a.id === id && (!userId || a.userId === userId))
    if (index === -1) return null
    addresses[index] = { ...addresses[index], ...updates }
    this.saveAddresses(addresses)
    return addresses[index]
  }

  static deleteAddress(id: string, userId?: string): boolean {
    if (USE_DATABASE) {
      console.warn('deleteAddress() 在数据库模式下应使用异步方法')
      return false
    }
    const addresses = this.getAddresses()
    const filtered = addresses.filter(a => !(a.id === id && (!userId || a.userId === userId)))
    if (filtered.length === addresses.length) return false
    this.saveAddresses(filtered)
    return true
  }

  // 地址相关 - 异步方法（数据库模式使用）
  static async getAddressesAsync(userId?: string): Promise<Address[]> {
    if (USE_DATABASE) {
      const query = userId
        ? 'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, create_time DESC'
        : 'SELECT * FROM addresses ORDER BY create_time DESC'
      const result = await getPool().query(query, userId ? [userId] : [])
      return result.rows.map(dbAddressToAddress)
    }
    return this.getAddresses(userId)
  }

  static async getAddressByIdAsync(id: string, userId?: string): Promise<Address | null> {
    if (USE_DATABASE) {
      const query = userId
        ? 'SELECT * FROM addresses WHERE id = $1 AND user_id = $2'
        : 'SELECT * FROM addresses WHERE id = $1'
      const result = await getPool().query(query, userId ? [id, userId] : [id])
      if (result.rows.length === 0) return null
      return dbAddressToAddress(result.rows[0])
    }
    return this.getAddressById(id, userId)
  }

  static async addAddressAsync(address: Address): Promise<void> {
    if (USE_DATABASE) {
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
      return
    }
    this.addAddress(address)
  }

  static async updateAddressAsync(id: string, updates: Partial<Address>, userId?: string): Promise<Address | null> {
    if (USE_DATABASE) {
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

      if (fields.length === 0) {
        return await this.getAddressByIdAsync(id, userId)
      }

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
      return await this.getAddressByIdAsync(id, userId)
    }
    return this.updateAddress(id, updates, userId)
  }

  static async deleteAddressAsync(id: string, userId?: string): Promise<boolean> {
    if (USE_DATABASE) {
      const query = userId
        ? 'DELETE FROM addresses WHERE id = $1 AND user_id = $2'
        : 'DELETE FROM addresses WHERE id = $1'
      const result = await getPool().query(query, userId ? [id, userId] : [id])
      return (result.rowCount ?? 0) > 0
    }
    return this.deleteAddress(id, userId)
  }

  static saveAddresses(addresses: Address[]): void {
    if (USE_DATABASE) {
      // 数据库模式不需要保存文件
      return
    }
    writeJsonFile(ADDRESSES_FILE, addresses)
  }

  // 订单相关 - 同步方法（兼容现有代码）
  static getOrders(userId?: string): Order[] {
    if (USE_DATABASE) {
      console.warn('getOrders() 在数据库模式下应使用异步方法')
      return []
    }
    const orders = readJsonFile<Order[]>(ORDERS_FILE, [])
    if (userId) {
      return orders.filter(o => o.userId === userId)
    }
    return orders
  }

  static getOrderById(id: string, userId?: string): Order | null {
    if (USE_DATABASE) {
      console.warn('getOrderById() 在数据库模式下应使用异步方法')
      return null
    }
    const orders = this.getOrders(userId)
    return orders.find(o => o.id === id) || null
  }

  static addOrder(order: Order): void {
    if (USE_DATABASE) {
      console.warn('addOrder() 在数据库模式下应使用异步方法')
      return
    }
    const orders = this.getOrders()
    orders.push(order)
    this.saveOrders(orders)
  }

  static updateOrder(order: Order, userId?: string): void {
    if (USE_DATABASE) {
      console.warn('updateOrder() 在数据库模式下应使用异步方法')
      return
    }
    const orders = this.getOrders()
    const index = orders.findIndex(o => o.id === order.id && (!userId || o.userId === userId))
    if (index !== -1) {
      orders[index] = order
      this.saveOrders(orders)
    }
  }

  static saveOrders(orders: Order[]): void {
    if (USE_DATABASE) {
      return
    }
    writeJsonFile(ORDERS_FILE, orders)
  }

  // 订单相关 - 异步方法（数据库模式使用）
  static async getOrdersAsync(userId?: string): Promise<Order[]> {
    if (USE_DATABASE) {
      const query = userId
        ? 'SELECT * FROM orders WHERE user_id = $1 ORDER BY create_time DESC'
        : 'SELECT * FROM orders ORDER BY create_time DESC'
      const result = await getPool().query(query, userId ? [userId] : [])
      
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
        
        const items: any[] = itemsResult.rows.map((item: any) => ({
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
    return this.getOrders(userId)
  }

  static async getOrderByIdAsync(id: string, userId?: string): Promise<Order | null> {
    if (USE_DATABASE) {
      const query = userId
        ? 'SELECT * FROM orders WHERE id = $1 AND user_id = $2'
        : 'SELECT * FROM orders WHERE id = $1'
      const result = await getPool().query(query, userId ? [id, userId] : [id])
      if (result.rows.length === 0) return null
      
      // 获取订单项和地址
      const row = result.rows[0]
      const itemsResult = await getPool().query('SELECT * FROM order_items WHERE order_id = $1', [id])
      const addressResult = await getPool().query('SELECT * FROM order_addresses WHERE order_id = $1', [id])
      
      const items = itemsResult.rows.map((item: any) => ({
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
      
      return {
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
      }
    }
    return this.getOrderById(id, userId)
  }

  static async addOrderAsync(order: Order): Promise<void> {
    if (USE_DATABASE) {
      const pool = getPool()
      
      // 开始事务
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        // 插入订单
        await client.query(
          `INSERT INTO orders (id, user_id, order_no, total_price, status, create_time, pay_time, ship_time, deliver_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i]
          await client.query(
            `INSERT INTO order_items (id, order_id, product_id, name, image, price, quantity, selected_specs)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
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
        }
        
        // 插入订单地址
        await client.query(
          `INSERT INTO order_addresses (id, order_id, name, phone, province, city, district, detail, is_default, tag)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            `${order.id}-addr`,
            order.id,
            order.address.name,
            order.address.phone,
            order.address.province,
            order.address.city,
            order.address.district,
            order.address.detail,
            order.address.isDefault,
            order.address.tag || null
          ]
        )
        
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
      return
    }
    this.addOrder(order)
  }

  static async updateOrderAsync(order: Order, userId?: string): Promise<void> {
    if (USE_DATABASE) {
      const pool = getPool()
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        
        await client.query(
          `UPDATE orders SET total_price = $1, status = $2, pay_time = $3, ship_time = $4, deliver_time = $5
           WHERE id = $6 ${userId ? 'AND user_id = $7' : ''}`,
          [
            order.totalPrice,
            order.status,
            order.payTime ? new Date(order.payTime) : null,
            order.shipTime ? new Date(order.shipTime) : null,
            order.deliverTime ? new Date(order.deliverTime) : null,
            order.id,
            ...(userId ? [userId] : [])
          ]
        )
        
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
      return
    }
    this.updateOrder(order, userId)
  }

  // 商品相关（保持 JSON 文件方式，因为商品数据量大且变化少）
  static getProducts(): Product[] {
    return readJsonFile<Product[]>(PRODUCTS_FILE, [])
  }

  static saveProducts(products: Product[]): void {
    writeJsonFile(PRODUCTS_FILE, products)
  }

  static getProductById(id: string): Product | null {
    const products = this.getProducts()
    return products.find(p => p.id === id) || null
  }

  // 分类相关
  static getCategories(): Category[] {
    return readJsonFile<Category[]>(CATEGORIES_FILE, [])
  }

  static saveCategories(categories: Category[]): void {
    writeJsonFile(CATEGORIES_FILE, categories)
  }

  // 首页数据
  static getHomePageData(): HomePageData {
    return readJsonFile<HomePageData>(HOMEPAGE_FILE, { components: [] })
  }

  static saveHomePageData(data: HomePageData): void {
    writeJsonFile(HOMEPAGE_FILE, data)
  }

  // 地区相关
  static getRegions(): any[] {
    return readJsonFile<any[]>(REGIONS_FILE, [])
  }
}

