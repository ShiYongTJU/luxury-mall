import { Request, Response, NextFunction } from 'express'
import { getPool } from '../database/pg-db'
import { AppError } from '../middleware/errorHandler'

// 获取所有首页组件配置
export const getHomepageComponents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pool = getPool()
    const result = await pool.query(`
      SELECT id, type, title, config, sort_order, is_enabled, create_time, update_time
      FROM homepage_components
      ORDER BY sort_order ASC, create_time ASC
    `)
    
    const components = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      config: row.config ? JSON.parse(row.config) : {},
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time,
      updateTime: row.update_time
    }))
    
    res.json(components)
  } catch (error) {
    next(error)
  }
}

// 获取单个首页组件配置
export const getHomepageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const result = await pool.query(`
      SELECT id, type, title, config, sort_order, is_enabled, create_time, update_time
      FROM homepage_components
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      const error: AppError = new Error('Component not found')
      error.statusCode = 404
      throw error
    }
    
    const row = result.rows[0]
    res.json({
      id: row.id,
      type: row.type,
      title: row.title,
      config: row.config ? JSON.parse(row.config) : {},
      sortOrder: row.sort_order,
      isEnabled: row.is_enabled,
      createTime: row.create_time,
      updateTime: row.update_time
    })
  } catch (error) {
    next(error)
  }
}

// 创建首页组件配置
export const createHomepageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, type, title, config, sortOrder, isEnabled } = req.body
    
    if (!id || !type) {
      const error: AppError = new Error('id and type are required')
      error.statusCode = 400
      throw error
    }
    
    const validTypes = ['carousel', 'seckill', 'groupbuy', 'productList', 'guessYouLike']
    if (!validTypes.includes(type)) {
      const error: AppError = new Error(`Invalid type. Must be one of: ${validTypes.join(', ')}`)
      error.statusCode = 400
      throw error
    }
    
    const pool = getPool()
    await pool.query(`
      INSERT INTO homepage_components (id, type, title, config, sort_order, is_enabled, create_time, update_time)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      id,
      type,
      title || null,
      config ? JSON.stringify(config) : null,
      sortOrder || 0,
      isEnabled !== undefined ? isEnabled : true
    ])
    
    res.status(201).json({ message: 'Component created successfully', id })
  } catch (error: any) {
    if (error.code === '23505') { // 唯一约束冲突
      const appError: AppError = new Error('Component with this id already exists')
      appError.statusCode = 409
      next(appError)
    } else {
      next(error)
    }
  }
}

// 更新首页组件配置
export const updateHomepageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { title, config, sortOrder, isEnabled } = req.body
    
    const pool = getPool()
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(title)
    }
    
    if (config !== undefined) {
      updates.push(`config = $${paramIndex++}`)
      values.push(JSON.stringify(config))
    }
    
    if (sortOrder !== undefined) {
      updates.push(`sort_order = $${paramIndex++}`)
      values.push(sortOrder)
    }
    
    if (isEnabled !== undefined) {
      updates.push(`is_enabled = $${paramIndex++}`)
      values.push(isEnabled)
    }
    
    if (updates.length === 0) {
      const error: AppError = new Error('No fields to update')
      error.statusCode = 400
      throw error
    }
    
    updates.push(`update_time = CURRENT_TIMESTAMP`)
    values.push(id)
    
    const result = await pool.query(`
      UPDATE homepage_components
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
    `, values)
    
    if (result.rowCount === 0) {
      const error: AppError = new Error('Component not found')
      error.statusCode = 404
      throw error
    }
    
    res.json({ message: 'Component updated successfully', id })
  } catch (error) {
    next(error)
  }
}

// 删除首页组件配置
export const deleteHomepageComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const result = await pool.query(`
      DELETE FROM homepage_components
      WHERE id = $1
    `, [id])
    
    if (result.rowCount === 0) {
      const error: AppError = new Error('Component not found')
      error.statusCode = 404
      throw error
    }
    
    res.json({ message: 'Component deleted successfully', id })
  } catch (error) {
    next(error)
  }
}

// 批量更新组件顺序
export const updateComponentsOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { components } = req.body // [{ id, sortOrder }, ...]
    
    if (!Array.isArray(components)) {
      const error: AppError = new Error('components must be an array')
      error.statusCode = 400
      throw error
    }
    
    const pool = getPool()
    
    // 使用事务批量更新
    await pool.query('BEGIN')
    
    try {
      for (const comp of components) {
        if (!comp.id || comp.sortOrder === undefined) {
          throw new Error('Each component must have id and sortOrder')
        }
        await pool.query(`
          UPDATE homepage_components
          SET sort_order = $1, update_time = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [comp.sortOrder, comp.id])
      }
      
      await pool.query('COMMIT')
      res.json({ message: 'Components order updated successfully' })
    } catch (error) {
      await pool.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    next(error)
  }
}

