/**
 * 快速创建 images 表的脚本
 * 如果 images 表不存在，直接创建它
 * 使用方法: npm run create-images-table-only
 * 或者: ts-node scripts/create-images-table-only.ts
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

async function createImagesTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'luxury_mall',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  })

  try {
    console.log('正在连接数据库...')
    console.log(`数据库: ${process.env.DB_NAME || 'luxury_mall'}`)
    console.log(`主机: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}`)
    
    // 测试连接
    await pool.query('SELECT NOW()')
    console.log('✓ 数据库连接成功')
    
    // 检查表是否存在
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'images'
      );
    `)
    
    if (checkResult.rows[0].exists) {
      console.log('✓ images 表已存在，无需创建')
      await pool.end()
      return
    }
    
    console.log('images 表不存在，开始创建...')
    
    // 创建 images 表
    const createTableSQL = `
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    url VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags VARCHAR(200),
    width INTEGER,
    height INTEGER,
    size INTEGER,
    format VARCHAR(20),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
    `.trim()
    
    await pool.query(createTableSQL)
    console.log('✓ images 表创建成功')
    
    // 创建索引
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);',
      'CREATE INDEX IF NOT EXISTS idx_images_tags ON images(tags);',
      'CREATE INDEX IF NOT EXISTS idx_images_upload_time ON images(upload_time);'
    ]
    
    for (const indexSQL of indexes) {
      try {
        await pool.query(indexSQL)
        const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'unknown'
        console.log(`✓ 索引 ${indexName} 创建成功`)
      } catch (error: any) {
        if (error.code === '42P16' || error.message?.includes('already exists')) {
          const indexName = indexSQL.match(/idx_\w+/)?.[0] || 'unknown'
          console.log(`⚠ 索引 ${indexName} 已存在，跳过`)
        } else {
          console.error(`✗ 创建索引失败:`, error.message)
        }
      }
    }
    
    // 验证表是否创建成功
    const verifyResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'images'
      );
    `)
    
    if (verifyResult.rows[0].exists) {
      console.log('\n✓ 验证成功：images 表已存在')
    } else {
      console.error('\n✗ 验证失败：images 表不存在')
      process.exit(1)
    }
    
    console.log('\n==========================================')
    console.log('images 表创建完成！')
    console.log('==========================================')

  } catch (error) {
    console.error('创建 images 表失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

createImagesTable()

