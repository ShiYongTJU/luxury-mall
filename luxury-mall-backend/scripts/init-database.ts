/**
 * 初始化数据库表结构
 * 执行 schema.sql 文件中的所有 SQL 语句
 * 使用方法: npm run init-database
 * 或者: ts-node scripts/init-database.ts
 */

import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function initDatabase() {
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
    
    // 读取 schema.sql 文件
    // 在容器中运行时，脚本在 dist/scripts/ 目录，schema.sql 在 dist/database/ 目录
    // 在开发环境运行时，脚本在 scripts/ 目录，schema.sql 在 src/database/ 目录
    let schemaPath = path.join(__dirname, '../dist/database/schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      // 尝试 src 目录（开发环境）
      schemaPath = path.join(__dirname, '../src/database/schema.sql')
    }
    
    if (!fs.existsSync(schemaPath)) {
      // 如果都不存在，尝试从当前工作目录查找
      const cwd = process.cwd()
      const altPath1 = path.join(cwd, 'dist/database/schema.sql')
      const altPath2 = path.join(cwd, 'src/database/schema.sql')
      
      if (fs.existsSync(altPath1)) {
        schemaPath = altPath1
      } else if (fs.existsSync(altPath2)) {
        schemaPath = altPath2
      } else {
        throw new Error(`schema.sql 文件不存在。已尝试:\n  - ${path.join(__dirname, '../dist/database/schema.sql')}\n  - ${path.join(__dirname, '../src/database/schema.sql')}\n  - ${altPath1}\n  - ${altPath2}`)
      }
    }
    
    console.log(`正在读取 schema.sql 文件: ${schemaPath}`)
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    
    // 分割 SQL 语句（按分号和换行符分割，但保留 CREATE TABLE 等完整语句）
    // 移除注释和空行
    const sqlStatements = schemaContent
      .split(/;\s*\n/)
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        stmt !== ''
      )
      .map(stmt => {
        // 移除行内注释
        return stmt.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .replace(/\/\*[\s\S]*?\*\//g, '') // 移除块注释
          .trim()
      })
      .filter(stmt => stmt.length > 0)
    
    console.log(`找到 ${sqlStatements.length} 条 SQL 语句`)
    
    // 执行每条 SQL 语句
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const sql = sqlStatements[i]
      
      // 跳过空语句
      if (!sql || sql.length < 10) {
        continue
      }
      
      try {
        // 执行 SQL
        await pool.query(sql)
        
        // 判断是创建表还是创建索引
        if (sql.toUpperCase().includes('CREATE TABLE')) {
          const tableMatch = sql.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i)
          if (tableMatch) {
            console.log(`✓ 创建表: ${tableMatch[1]}`)
            successCount++
          } else {
            successCount++
          }
        } else if (sql.toUpperCase().includes('CREATE INDEX')) {
          const indexMatch = sql.match(/CREATE INDEX\s+(?:IF NOT EXISTS\s+)?(\w+)/i)
          if (indexMatch) {
            console.log(`✓ 创建索引: ${indexMatch[1]}`)
            successCount++
          } else {
            successCount++
          }
        } else {
          // 其他 SQL 语句
          console.log(`✓ 执行 SQL 语句 ${i + 1}`)
          successCount++
        }
      } catch (error: any) {
        // 如果是"已存在"的错误，跳过
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' // PostgreSQL: relation already exists
        )) {
          console.log(`⚠ 跳过（已存在）: ${sql.substring(0, 50)}...`)
          skipCount++
        } else {
          console.error(`✗ SQL 执行失败 (${i + 1}):`, error.message)
          console.error(`SQL: ${sql.substring(0, 100)}...`)
          errorCount++
        }
      }
    }
    
    console.log('\n==========================================')
    console.log('数据库初始化完成！')
    console.log(`成功: ${successCount} 条`)
    console.log(`跳过: ${skipCount} 条（已存在）`)
    console.log(`失败: ${errorCount} 条`)
    console.log('==========================================')
    
    // 验证关键表是否存在
    console.log('\n验证关键表...')
    const tables = ['users', 'products', 'orders', 'images']
    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [table])
        
        if (result.rows[0].exists) {
          console.log(`✓ 表 ${table} 存在`)
        } else {
          console.log(`✗ 表 ${table} 不存在`)
        }
      } catch (error) {
        console.error(`✗ 验证表 ${table} 失败:`, error)
      }
    }
    
    if (errorCount > 0) {
      process.exit(1)
    }

  } catch (error) {
    console.error('数据库初始化失败:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

initDatabase()

