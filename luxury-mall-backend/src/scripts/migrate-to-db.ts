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

  for (const addr of addresses) {
    try {
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
    } catch (error: any) {
      if (error.code !== '23505') {
        console.error(`迁移地址 ${addr.id} 失败:`, error.message)
      }
    }
  }
  console.log('地址迁移完成')
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

  for (const order of orders) {
    try {
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
        }
      }

      // 插入订单地址
      if (order.address) {
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
      }
    } catch (error: any) {
      console.error(`迁移订单 ${order.id} 失败:`, error.message)
    }
  }
  console.log('订单迁移完成')
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

async function main() {
  console.log('开始数据迁移...')
  
  // 初始化数据库连接
  const pool = initDatabase()

  try {
    // 读取并执行 SQL 脚本创建表
    const schemaPath = path.join(__dirname, '../database/schema.sql')
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8')
      await pool.query(schema)
      console.log('数据库表结构创建完成')
    }

    // 迁移数据
    await migrateUsers(pool)
    await migrateAddresses(pool)
    await migrateProducts(pool)
    await migrateOrders(pool)
    await migrateRegions(pool)

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


