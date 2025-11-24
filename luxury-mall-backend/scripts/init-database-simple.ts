/**
 * 简化版数据库初始化脚本
 * 直接使用 psql 执行 schema.sql 文件（更可靠）
 * 使用方法: npm run init-database-simple
 * 或者: ts-node scripts/init-database-simple.ts
 */

import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

dotenv.config()

async function initDatabaseSimple() {
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
    let schemaPath = path.join(__dirname, '../dist/database/schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.join(__dirname, '../src/database/schema.sql')
    }
    
    if (!fs.existsSync(schemaPath)) {
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
    
    // 方法1: 尝试使用 psql 直接执行（如果可用，这是最可靠的方法）
    const usePsql = process.env.USE_PSQL !== 'false'
    
    if (usePsql) {
      try {
        console.log('尝试使用 psql 执行 schema.sql...')
        const dbHost = process.env.DB_HOST || 'localhost'
        const dbPort = process.env.DB_PORT || '5432'
        const dbName = process.env.DB_NAME || 'luxury_mall'
        const dbUser = process.env.DB_USER || 'postgres'
        const dbPassword = process.env.DB_PASSWORD || 'postgres'
        
        // 使用 PGPASSWORD 环境变量传递密码
        const env = {
          ...process.env,
          PGPASSWORD: dbPassword
        }
        
        const psqlCommand = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${schemaPath}`
        
        console.log(`执行命令: psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -f ${schemaPath}`)
        
        const { stdout, stderr } = await execAsync(psqlCommand, { env })
        
        if (stdout) {
          console.log('psql 输出:', stdout)
        }
        if (stderr && !stderr.includes('already exists')) {
          console.warn('psql 警告:', stderr)
        }
        
        console.log('✓ 使用 psql 执行完成')
        
        // 验证关键表
        await verifyTables(pool)
        await pool.end()
        return
      } catch (error: any) {
        if (error.message && error.message.includes('psql: not found')) {
          console.log('psql 不可用，使用 Node.js 方式执行...')
        } else {
          console.warn('psql 执行失败，使用 Node.js 方式执行:', error.message)
        }
      }
    }
    
    // 方法2: 使用 Node.js 执行（逐条执行 SQL）
    console.log('使用 Node.js 方式执行 SQL...')
    
    // 改进的 SQL 分割逻辑：按分号分割，但保留多行语句
    const statements: string[] = []
    let currentStatement = ''
    const lines = schemaContent.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // 跳过注释行
      if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*') || trimmedLine === '') {
        continue
      }
      
      // 移除行尾注释
      const lineWithoutComment = trimmedLine.split('--')[0].trim()
      
      currentStatement += lineWithoutComment + ' '
      
      // 如果行以分号结尾，说明是一个完整的语句
      if (lineWithoutComment.endsWith(';')) {
        const stmt = currentStatement.trim()
        if (stmt.length > 5) { // 至少包含一些内容
          statements.push(stmt)
        }
        currentStatement = ''
      }
    }
    
    // 处理最后一个语句（如果没有分号结尾）
    if (currentStatement.trim().length > 5) {
      statements.push(currentStatement.trim() + ';')
    }
    
    console.log(`找到 ${statements.length} 条 SQL 语句`)
    
    let successCount = 0
    let skipCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const sql = statements[i]
      
      try {
        await pool.query(sql)
        
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
          successCount++
        }
      } catch (error: any) {
        if (error.message && (
          error.message.includes('already exists') ||
          error.message.includes('duplicate') ||
          error.code === '42P07' || // PostgreSQL: relation already exists
          error.code === '42P16'    // PostgreSQL: index already exists
        )) {
          console.log(`⚠ 跳过（已存在）: ${sql.substring(0, 60)}...`)
          skipCount++
        } else {
          console.error(`✗ SQL 执行失败 (${i + 1}):`, error.message)
          console.error(`SQL: ${sql.substring(0, 150)}...`)
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
    
    // 验证关键表
    await verifyTables(pool)
    
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

async function verifyTables(pool: Pool) {
  console.log('\n验证关键表...')
  const tables = ['users', 'products', 'orders', 'images', 'addresses', 'categories']
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
}

initDatabaseSimple()

