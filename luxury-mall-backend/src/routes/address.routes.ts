import { Router } from 'express'
import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/address.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

// 所有地址相关路由都需要认证
router.use(authenticate)

router.get('/', getAddresses)
router.get('/:id', getAddressById)
router.post('/', createAddress)
router.put('/:id', updateAddress)
router.delete('/:id', deleteAddress)
router.patch('/:id/default', setDefaultAddress)

export default router

