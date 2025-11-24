import { Router } from 'express'
import { getProducts, getProductById, getCategories, getHomePageData, updateProduct } from '../controllers/product.controller'

const router = Router()

router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/homepage', getHomePageData)
router.get('/:id', getProductById)
router.put('/:id', updateProduct)
router.patch('/:id', updateProduct)

export default router




