import { Router } from 'express'
import {
  getDataSourceItems,
  getDataSourceItemById,
  createDataSourceItem,
  updateDataSourceItem,
  deleteDataSourceItem
} from '../controllers/datasource.controller'

const router = Router()

// 所有路由都需要 :type 参数来指定数据源类型
router.get('/:type', getDataSourceItems)
router.get('/:type/:id', getDataSourceItemById)
router.post('/:type', createDataSourceItem)
router.put('/:type/:id', updateDataSourceItem)
router.patch('/:type/:id', updateDataSourceItem)
router.delete('/:type/:id', deleteDataSourceItem)

export default router

