import { Router } from 'express'
import {
  getDataSourceItems,
  getDataSourceItemById,
  createDataSourceItem,
  updateDataSourceItem,
  deleteDataSourceItem
} from '../controllers/datasource.controller'
import { checkDataSourcePermission } from '../middleware/adminPermission'

const router = Router()

// 所有路由都需要 :type 参数来指定数据源类型
// 使用动态权限检查中间件
router.get('/:type', ...checkDataSourcePermission(), getDataSourceItems)
router.get('/:type/:id', ...checkDataSourcePermission(), getDataSourceItemById)
router.post('/:type', ...checkDataSourcePermission(), createDataSourceItem)
router.put('/:type/:id', ...checkDataSourcePermission(), updateDataSourceItem)
router.patch('/:type/:id', ...checkDataSourcePermission(), updateDataSourceItem)
router.delete('/:type/:id', ...checkDataSourcePermission(), deleteDataSourceItem)

export default router

