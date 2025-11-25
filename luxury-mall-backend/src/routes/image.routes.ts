import { Router } from 'express'
import { getImages, getImageById, updateImage, addImage, deleteImage } from '../controllers/image.controller'
import { checkAdminPermission } from '../middleware/adminPermission'

const router = Router()

// GET请求需要菜单权限，POST/PUT/DELETE需要按钮权限
router.get('/', ...checkAdminPermission('menu:product:image:list'), getImages)
router.get('/:id', ...checkAdminPermission('menu:product:image:list'), getImageById)
router.put('/:id', ...checkAdminPermission('menu:product:image:list', 'button:image:edit'), updateImage)
router.patch('/:id', ...checkAdminPermission('menu:product:image:list', 'button:image:edit'), updateImage)
router.delete('/:id', ...checkAdminPermission('menu:product:image:list', 'button:image:delete'), deleteImage)

export default router

