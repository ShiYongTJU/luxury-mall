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
    const tableExistsResult = await tableExists('pages')
    
    if (tableExistsResult) {
      console.log('✓ pages 表已存在，检查字段...')
      
      // 检查 name 字段是否存在，如果不存在则添加
      const checkColumn = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pages' 
        AND column_name = 'name'
      `)
      
      if (checkColumn.rows.length === 0) {
        console.log('  正在添加 name 字段...')
        await pool.query('ALTER TABLE pages ADD COLUMN name VARCHAR(200)')
        console.log('  ✓ name 字段添加成功')
      } else {
        console.log('  ✓ name 字段已存在')
      }
      
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
        name VARCHAR(200) NOT NULL,
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
 * 创建数据源表（轮播图、秒杀、团购、商品列表、猜你喜欢）
 */
async function createDataSourceTables() {
  const tables = [
    { name: 'carousel_items', displayName: '轮播图' },
    { name: 'seckill_items', displayName: '秒杀' },
    { name: 'groupbuy_items', displayName: '团购' },
    { name: 'product_list_items', displayName: '商品列表' },
    { name: 'guess_you_like_items', displayName: '猜你喜欢' }
  ]

  for (const table of tables) {
    try {
      const pool = getPool()
      console.log(`正在检查 ${table.displayName} 表...`)

      const tableExistsResult = await tableExists(table.name)

      if (tableExistsResult) {
        console.log(`✓ ${table.displayName} 表已存在，跳过创建`)

        // 检查索引
        await createIndexIfNotExists(
          `idx_${table.name}_sort_order`,
          `CREATE INDEX idx_${table.name}_sort_order ON ${table.name}(sort_order)`
        )
        await createIndexIfNotExists(
          `idx_${table.name}_is_enabled`,
          `CREATE INDEX idx_${table.name}_is_enabled ON ${table.name}(is_enabled)`
        )
        continue
      }

      // 创建表
      await pool.query(`
        CREATE TABLE ${table.name} (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(200) NOT NULL,
          config TEXT,
          data TEXT NOT NULL,
          sort_order INTEGER DEFAULT 0,
          is_enabled BOOLEAN DEFAULT TRUE,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log(`✓ ${table.displayName} 表创建成功`)

      // 创建索引
      await createIndexIfNotExists(
        `idx_${table.name}_sort_order`,
        `CREATE INDEX idx_${table.name}_sort_order ON ${table.name}(sort_order)`
      )
      await createIndexIfNotExists(
        `idx_${table.name}_is_enabled`,
        `CREATE INDEX idx_${table.name}_is_enabled ON ${table.name}(is_enabled)`
      )

    } catch (error: any) {
      console.error(`✗ 创建 ${table.displayName} 表失败:`, error.message)
      throw error
    }
  }
}

/**
 * 创建权限管理系统表
 */
async function createAuthTables() {
  try {
    const pool = getPool()
    console.log('正在检查权限管理系统表...')

    // 1. 创建 admin_users 表
    if (!(await tableExists('admin_users'))) {
      await pool.query(`
        CREATE TABLE admin_users (
          id VARCHAR(100) PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          phone VARCHAR(20),
          real_name VARCHAR(50),
          status VARCHAR(20) DEFAULT 'active',
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login_time TIMESTAMP
        )
      `)
      console.log('✓ admin_users 表创建成功')
    } else {
      console.log('✓ admin_users 表已存在')
    }
    await createIndexIfNotExists('idx_admin_users_username', 'CREATE INDEX idx_admin_users_username ON admin_users(username)')
    await createIndexIfNotExists('idx_admin_users_status', 'CREATE INDEX idx_admin_users_status ON admin_users(status)')

    // 2. 创建 roles 表
    if (!(await tableExists('roles'))) {
      await pool.query(`
        CREATE TABLE roles (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(50) NOT NULL UNIQUE,
          code VARCHAR(50) NOT NULL UNIQUE,
          description TEXT,
          is_system BOOLEAN DEFAULT FALSE,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      console.log('✓ roles 表创建成功')
    } else {
      console.log('✓ roles 表已存在')
    }
    await createIndexIfNotExists('idx_roles_code', 'CREATE INDEX idx_roles_code ON roles(code)')
    await createIndexIfNotExists('idx_roles_is_system', 'CREATE INDEX idx_roles_is_system ON roles(is_system)')

    // 3. 创建 permissions 表
    if (!(await tableExists('permissions'))) {
      await pool.query(`
        CREATE TABLE permissions (
          id VARCHAR(100) PRIMARY KEY,
          code VARCHAR(100) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL,
          parent_id VARCHAR(100),
          path VARCHAR(200),
          description TEXT,
          sort_order INTEGER DEFAULT 0,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES permissions(id) ON DELETE CASCADE
        )
      `)
      console.log('✓ permissions 表创建成功')
    } else {
      console.log('✓ permissions 表已存在')
    }
    await createIndexIfNotExists('idx_permissions_code', 'CREATE INDEX idx_permissions_code ON permissions(code)')
    await createIndexIfNotExists('idx_permissions_type', 'CREATE INDEX idx_permissions_type ON permissions(type)')
    await createIndexIfNotExists('idx_permissions_parent_id', 'CREATE INDEX idx_permissions_parent_id ON permissions(parent_id)')
    await createIndexIfNotExists('idx_permissions_sort_order', 'CREATE INDEX idx_permissions_sort_order ON permissions(sort_order)')

    // 4. 创建 user_roles 表
    if (!(await tableExists('user_roles'))) {
      await pool.query(`
        CREATE TABLE user_roles (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          role_id VARCHAR(100) NOT NULL,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          UNIQUE(user_id, role_id)
        )
      `)
      console.log('✓ user_roles 表创建成功')
    } else {
      console.log('✓ user_roles 表已存在')
    }
    await createIndexIfNotExists('idx_user_roles_user_id', 'CREATE INDEX idx_user_roles_user_id ON user_roles(user_id)')
    await createIndexIfNotExists('idx_user_roles_role_id', 'CREATE INDEX idx_user_roles_role_id ON user_roles(role_id)')

    // 5. 创建 role_permissions 表
    if (!(await tableExists('role_permissions'))) {
      await pool.query(`
        CREATE TABLE role_permissions (
          id VARCHAR(100) PRIMARY KEY,
          role_id VARCHAR(100) NOT NULL,
          permission_id VARCHAR(100) NOT NULL,
          create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE(role_id, permission_id)
        )
      `)
      console.log('✓ role_permissions 表创建成功')
    } else {
      console.log('✓ role_permissions 表已存在')
    }
    await createIndexIfNotExists('idx_role_permissions_role_id', 'CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id)')
    await createIndexIfNotExists('idx_role_permissions_permission_id', 'CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id)')

    // 6. 初始化系统管理员角色
    const roleCheck = await pool.query('SELECT id FROM roles WHERE code = $1', ['admin'])
    if (roleCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO roles (id, name, code, description, is_system) 
        VALUES ('role_system_admin', '系统管理员', 'admin', '拥有所有权限的系统管理员', TRUE)
      `)
      console.log('✓ 系统管理员角色初始化成功')
    } else {
      console.log('✓ 系统管理员角色已存在')
    }

    // 7. 初始化默认权限（菜单权限）
    const defaultMenuPermissions = [
      { id: 'perm_menu_operation', code: 'menu:operation', name: '运营中心', path: '/admin/operation', sortOrder: 1 },
      { id: 'perm_menu_product', code: 'menu:product', name: '商品中心', path: '/admin/product', sortOrder: 2 },
      { id: 'perm_menu_operation_page', code: 'menu:operation:page', name: '页面管理', path: '/admin/operation/page', sortOrder: 11 },
      { id: 'perm_menu_operation_carousel', code: 'menu:operation:carousel', name: '轮播图', path: '/admin/operation/carousel', sortOrder: 21 },
      { id: 'perm_menu_operation_seckill', code: 'menu:operation:seckill', name: '秒杀', path: '/admin/operation/seckill', sortOrder: 22 },
      { id: 'perm_menu_operation_groupbuy', code: 'menu:operation:groupbuy', name: '团购', path: '/admin/operation/groupbuy', sortOrder: 23 },
      { id: 'perm_menu_operation_productList', code: 'menu:operation:productList', name: '商品列表', path: '/admin/operation/productList', sortOrder: 24 },
      { id: 'perm_menu_operation_guessYouLike', code: 'menu:operation:guessYouLike', name: '猜你喜欢', path: '/admin/operation/guessYouLike', sortOrder: 25 },
      { id: 'perm_menu_product_list', code: 'menu:product:list', name: '商品列表', path: '/admin/product/list', sortOrder: 31 },
      { id: 'perm_menu_product_image_list', code: 'menu:product:image:list', name: '图片列表', path: '/admin/operation/image/list', sortOrder: 41 },
      { id: 'perm_menu_product_image_gallery', code: 'menu:product:image:gallery', name: '静态资源', path: '/admin/operation/image/gallery', sortOrder: 42 }
    ]

    for (const perm of defaultMenuPermissions) {
      const permCheck = await pool.query('SELECT id FROM permissions WHERE code = $1', [perm.code])
      if (permCheck.rows.length === 0) {
        await pool.query(`
          INSERT INTO permissions (id, code, name, type, path, description, sort_order)
          VALUES ($1, $2, $3, 'menu', $4, $5, $6)
        `, [perm.id, perm.code, perm.name, perm.path, `${perm.name}菜单`, perm.sortOrder])
      }
    }
    console.log('✓ 默认菜单权限初始化完成')

    // 8. 初始化默认权限（按钮权限）
    const defaultButtonPermissions = [
      { id: 'perm_btn_product_add', code: 'button:product:add', name: '新增商品', parentId: 'perm_menu_product_list', path: 'product:add', sortOrder: 1 },
      { id: 'perm_btn_product_edit', code: 'button:product:edit', name: '编辑商品', parentId: 'perm_menu_product_list', path: 'product:edit', sortOrder: 2 },
      { id: 'perm_btn_product_delete', code: 'button:product:delete', name: '删除商品', parentId: 'perm_menu_product_list', path: 'product:delete', sortOrder: 3 },
      { id: 'perm_btn_page_add', code: 'button:page:add', name: '新增页面', parentId: 'perm_menu_operation_page', path: 'page:add', sortOrder: 11 },
      { id: 'perm_btn_page_edit', code: 'button:page:edit', name: '编辑页面', parentId: 'perm_menu_operation_page', path: 'page:edit', sortOrder: 12 },
      { id: 'perm_btn_page_delete', code: 'button:page:delete', name: '删除页面', parentId: 'perm_menu_operation_page', path: 'page:delete', sortOrder: 13 },
      { id: 'perm_btn_page_publish', code: 'button:page:publish', name: '发布页面', parentId: 'perm_menu_operation_page', path: 'page:publish', sortOrder: 14 }
    ]

    for (const perm of defaultButtonPermissions) {
      const permCheck = await pool.query('SELECT id FROM permissions WHERE code = $1', [perm.code])
      if (permCheck.rows.length === 0) {
        await pool.query(`
          INSERT INTO permissions (id, code, name, type, parent_id, path, description, sort_order)
          VALUES ($1, $2, $3, 'button', $4, $5, $6, $7)
        `, [perm.id, perm.code, perm.name, perm.parentId, perm.path, `${perm.name}按钮`, perm.sortOrder])
      }
    }
    console.log('✓ 默认按钮权限初始化完成')

    // 9. 给系统管理员角色分配所有权限
    const adminRole = await pool.query('SELECT id FROM roles WHERE code = $1', ['admin'])
    if (adminRole.rows.length > 0) {
      const roleId = adminRole.rows[0].id
      const allPermissions = await pool.query('SELECT id FROM permissions')
      
      for (const perm of allPermissions.rows) {
        const rpCheck = await pool.query(
          'SELECT id FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
          [roleId, perm.id]
        )
        if (rpCheck.rows.length === 0) {
          await pool.query(
            'INSERT INTO role_permissions (id, role_id, permission_id) VALUES ($1, $2, $3)',
            [`rp_${roleId}_${perm.id}`, roleId, perm.id]
          )
        }
      }
      console.log('✓ 系统管理员角色权限分配完成')
    }

    console.log('✓ 权限管理系统表检查完成\n')

  } catch (error: any) {
    console.error('✗ 创建权限管理系统表失败:', error.message)
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
    await createDataSourceTables()
    await createAuthTables()

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

