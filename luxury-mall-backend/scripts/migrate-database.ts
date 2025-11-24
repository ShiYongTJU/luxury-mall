/**
 * 数据库迁移脚本
 * 统一管理所有表的创建和结构变更
 * 
 * 使用方法：
 * npm run migrate-database
 * 
 * 或在Docker容器中执行：
 * docker exec -it luxury-mall-backend npm run migrate-database
 * 
 * 注意：
 * - 此脚本会检查表是否存在，如果存在则跳过创建
 * - 此脚本会检查索引是否存在，如果存在则跳过创建
 * - 此脚本可以安全地多次执行，不会重复创建
 * - 所有表结构变更都应该在此脚本中统一管理
 */

import { initDatabase, getPool } from '../src/database/pg-db'
import * as dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

// 初始化数据库连接
initDatabase()

/**
 * 检查表是否存在
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    const pool = getPool()
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )
    `, [tableName])
    return result.rows[0].exists
  } catch (error) {
    return false
  }
}

/**
 * 检查索引是否存在
 */
async function indexExists(indexName: string): Promise<boolean> {
  try {
    const pool = getPool()
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname = $1
      )
    `, [indexName])
    return result.rows[0].exists
  } catch (error) {
    return false
  }
}

/**
 * 安全创建索引（如果不存在）
 */
async function createIndexIfNotExists(indexName: string, sql: string) {
  try {
    const pool = getPool()
    if (await indexExists(indexName)) {
      console.log(`  ✓ 索引 ${indexName} 已存在，跳过创建`)
      return
    }
    await pool.query(sql)
    console.log(`  ✓ 创建索引: ${indexName}`)
  } catch (error: any) {
    console.error(`  ✗ 创建索引 ${indexName} 失败:`, error.message)
    throw error
  }
}

/**
 * 创建 pages 表
 */
async function createPagesTable() {
  try {
    const pool = getPool()
    console.log('正在检查 pages 表...')

    // 检查表是否存在
    if (await tableExists('pages')) {
      console.log('✓ pages 表已存在，跳过创建')
      
      // 检查索引是否存在，如果不存在则创建
      await createIndexIfNotExists('idx_pages_page_type', 'CREATE INDEX idx_pages_page_type ON pages(page_type)')
      await createIndexIfNotExists('idx_pages_is_published', 'CREATE INDEX idx_pages_is_published ON pages(is_published)')
      await createIndexIfNotExists('idx_pages_create_time', 'CREATE INDEX idx_pages_create_time ON pages(create_time)')
      await createIndexIfNotExists('idx_pages_last_operation_time', 'CREATE INDEX idx_pages_last_operation_time ON pages(last_operation_time)')
      return
    }

    // 创建表
    await pool.query(`
      CREATE TABLE pages (
        id VARCHAR(100) PRIMARY KEY,
        page_type VARCHAR(20) NOT NULL,
        data_source TEXT,
        is_published BOOLEAN DEFAULT FALSE,
        create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_operation_time TIMESTAMP,
        last_operation_type VARCHAR(20)
      )
    `)
    console.log('✓ pages 表创建成功')

    // 创建索引
    await createIndexIfNotExists('idx_pages_page_type', 'CREATE INDEX idx_pages_page_type ON pages(page_type)')
    await createIndexIfNotExists('idx_pages_is_published', 'CREATE INDEX idx_pages_is_published ON pages(is_published)')
    await createIndexIfNotExists('idx_pages_create_time', 'CREATE INDEX idx_pages_create_time ON pages(create_time)')
    await createIndexIfNotExists('idx_pages_last_operation_time', 'CREATE INDEX idx_pages_last_operation_time ON pages(last_operation_time)')

  } catch (error: any) {
    console.error('✗ 创建 pages 表失败:', error.message)
    throw error
  }
}

/**
 * 检查并创建所有必需的表
 * 
 * 所有新增表或表结构变更都应该在此函数中添加
 */
async function migrateDatabase() {
  try {
    console.log('==========================================')
    console.log('开始数据库迁移')
    console.log('==========================================\n')

    // 测试数据库连接
    console.log('正在测试数据库连接...')
    const pool = getPool()
    await pool.query('SELECT NOW()')
    console.log('✓ 数据库连接成功\n')

    // 执行所有迁移
    // 注意：所有新增表或表结构变更都应该在此处添加对应的函数调用
    await createPagesTable()

    console.log('\n==========================================')
    console.log('数据库迁移完成！')
    console.log('==========================================\n')

  } catch (error: any) {
    console.error('\n==========================================')
    console.error('数据库迁移失败！')
    console.error('==========================================')
    console.error('错误信息:', error.message)
    if (error.stack) {
      console.error('错误堆栈:', error.stack)
    }
    console.error('==========================================\n')
    process.exit(1)
  }
}

// 运行迁移
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('迁移脚本执行完成')
      process.exit(0)
    })
    .catch((error) => {
      console.error('迁移脚本执行失败:', error)
      process.exit(1)
    })
}

export { migrateDatabase }

