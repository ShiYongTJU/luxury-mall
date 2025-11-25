import { Router } from 'express'
import {
  getPages,
  getPageById,
  createPage,
  updatePage,
  publishPage,
  operatePage,
  deletePage
} from '../controllers/page.controller'
import { checkAdminPermission } from '../middleware/adminPermission'

const router = Router()

// GET请求需要菜单权限，POST/PUT/DELETE需要按钮权限
router.get('/', ...checkAdminPermission('menu:operation:page'), getPages)
router.get('/:id', ...checkAdminPermission('menu:operation:page'), getPageById)
router.post('/', ...checkAdminPermission('menu:operation:page', 'button:page:add'), createPage)
router.put('/:id', ...checkAdminPermission('menu:operation:page', 'button:page:edit'), updatePage)
router.patch('/:id', ...checkAdminPermission('menu:operation:page', 'button:page:edit'), updatePage)
router.post('/:id/publish', ...checkAdminPermission('menu:operation:page', 'button:page:publish'), publishPage)
router.post('/:id/operate', ...checkAdminPermission('menu:operation:page', 'button:page:edit'), operatePage)
router.delete('/:id', ...checkAdminPermission('menu:operation:page', 'button:page:delete'), deletePage)

export default router

