import { Request, Response, NextFunction } from 'express'
import { getPool } from '../database/pg-db'
import { AppError } from '../middleware/errorHandler'

// 获取所有分类页组件配置
export const getCategoryComponents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pool = getPool()
    const result = await pool.query(`
      SELECT cc.id, cc.category_id, cc.category_code, cc.title, cc.icon, cc.config, 
             cc.sort_order, cc.is_enabled, cc.create_time, cc.update_time,
             c.name as category_name, c.code as category_code_from_table
      FROM category_components cc
      LEFT JOIN categories c ON cc.category_id = c.id
      ORDER BY cc.sort_order ASC, cc.create_time ASC
    `)
    
    const components = result.rows.map((row: any) => ({
      id: row.id,
      categoryId: row.category_id,
      categoryCode: row.category_code || row.category_code_from_table,
      categoryName: row.category_name,
      title: row.title,
      icon: row.icon,
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

// 获取单个分类页组件配置
export const getCategoryComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const result = await pool.query(`
      SELECT cc.id, cc.category_id, cc.category_code, cc.title, cc.icon, cc.config, 
             cc.sort_order, cc.is_enabled, cc.create_time, cc.update_time,
             c.name as category_name, c.code as category_code_from_table
      FROM category_components cc
      LEFT JOIN categories c ON cc.category_id = c.id
      WHERE cc.id = $1
    `, [id])
    
    if (result.rows.length === 0) {
      const error: AppError = new Error('Component not found')
      error.statusCode = 404
      throw error
    }
    
    const row = result.rows[0]
    res.json({
      id: row.id,
      categoryId: row.category_id,
      categoryCode: row.category_code || row.category_code_from_table,
      categoryName: row.category_name,
      title: row.title,
      icon: row.icon,
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

// 创建分类页组件配置
export const createCategoryComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, categoryId, categoryCode, title, icon, config, sortOrder, isEnabled } = req.body
    
    if (!id || !categoryId) {
      const error: AppError = new Error('id and categoryId are required')
      error.statusCode = 400
      throw error
    }
    
    // 验证分类是否存在
    const pool = getPool()
    const categoryCheck = await pool.query(`
      SELECT id, code FROM categories WHERE id = $1 AND parent_id IS NULL
    `, [categoryId])
    
    if (categoryCheck.rows.length === 0) {
      const error: AppError = new Error('Category not found or is not a main category')
      error.statusCode = 404
      throw error
    }
    
    const actualCategoryCode = categoryCode || categoryCheck.rows[0].code
    
    await pool.query(`
      INSERT INTO category_components (id, category_id, category_code, title, icon, config, sort_order, is_enabled, create_time, update_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      id,
      categoryId,
      actualCategoryCode,
      title || null,
      icon || null,
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

// 更新分类页组件配置
export const updateCategoryComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const { categoryId, categoryCode, title, icon, config, sortOrder, isEnabled } = req.body
    
    const pool = getPool()
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    if (categoryId !== undefined) {
      // 验证分类是否存在
      const categoryCheck = await pool.query(`
        SELECT id, code FROM categories WHERE id = $1 AND parent_id IS NULL
      `, [categoryId])
      
      if (categoryCheck.rows.length === 0) {
        const error: AppError = new Error('Category not found or is not a main category')
        error.statusCode = 404
        throw error
      }
      
      updates.push(`category_id = $${paramIndex++}`)
      values.push(categoryId)
      
      if (categoryCode === undefined) {
        // 如果没有提供 categoryCode，使用分类表中的 code
        updates.push(`category_code = $${paramIndex++}`)
        values.push(categoryCheck.rows[0].code)
      }
    }
    
    if (categoryCode !== undefined) {
      updates.push(`category_code = $${paramIndex++}`)
      values.push(categoryCode)
    }
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(title)
    }
    
    if (icon !== undefined) {
      updates.push(`icon = $${paramIndex++}`)
      values.push(icon)
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
      UPDATE category_components
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

// 删除分类页组件配置
export const deleteCategoryComponent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const pool = getPool()
    const result = await pool.query(`
      DELETE FROM category_components
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

// 批量更新分类页组件顺序
export const updateCategoryComponentsOrder = async (
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
          UPDATE category_components
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

