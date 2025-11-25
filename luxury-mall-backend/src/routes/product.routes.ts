import { Router } from 'express'
import { getProducts, getProductById, getCategories, getHomePageData, updateProduct, addProduct } from '../controllers/product.controller'
import { checkAdminPermission } from '../middleware/adminPermission'

const router = Router()

// GET请求需要菜单权限，POST/PUT/DELETE需要按钮权限
router.get('/', ...checkAdminPermission('menu:product:list'), getProducts)
router.get('/categories', getCategories) // 前端用户也可以访问
router.get('/homepage', getHomePageData) // 前端用户也可以访问
router.get('/:id', ...checkAdminPermission('menu:product:list'), getProductById)
router.put('/:id', ...checkAdminPermission('menu:product:list', 'button:product:edit'), updateProduct)
router.patch('/:id', ...checkAdminPermission('menu:product:list', 'button:product:edit'), updateProduct)

export default router




