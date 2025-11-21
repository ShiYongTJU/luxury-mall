import { Router } from 'express'
import { getProducts, getProductById, getCategories, getHomePageData } from '../controllers/product.controller'

const router = Router()

router.get('/', getProducts)
router.get('/categories', getCategories)
router.get('/homepage', getHomePageData)
router.get('/:id', getProductById)

export default router




