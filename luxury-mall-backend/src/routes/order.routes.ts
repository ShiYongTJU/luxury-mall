import { Router } from 'express'
import { createOrder, getOrders, getOrderById, payOrder, cancelOrder } from '../controllers/order.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

// 所有订单相关路由都需要认证
router.use(authenticate)

router.post('/', createOrder)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/:id/pay', payOrder)
router.post('/:id/cancel', cancelOrder)

export default router




