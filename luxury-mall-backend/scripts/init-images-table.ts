/**
 * 初始化 images 表的脚本
 * 使用方法: npm run init-images-table
 * 或者: ts-node scripts/init-images-table.ts
 */

import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function initImagesTable() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'luxury_mall',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  })

  try {
    console.log('正在连接数据库...')
    
    // 读取 schema.sql 文件中的 images 表创建语句
    const schemaPath = path.join(__dirname, '../src/database/schema.sql')
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    
    // 提取 images 表相关的 SQL
    const imagesTableSQL = `
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

CREATE INDEX IF NOT EXISTS idx_images_category ON images(category);
CREATE INDEX IF NOT EXISTS idx_images_tags ON images(tags);
CREATE INDEX IF NOT EXISTS idx_images_upload_time ON images(upload_time);
    `.trim()

    console.log('正在创建 images 表...')
    await pool.query(imagesTableSQL)
    console.log('✓ images 表创建成功！')

    // 验证表是否存在
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'images'
      );
    `)
    
    if (result.rows[0].exists) {
      console.log('✓ 验证成功：images 表已存在')
    } else {
      console.error('✗ 验证失败：images 表不存在')
    }

  } catch (error) {
    console.error('创建 images 表失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

initImagesTable()

