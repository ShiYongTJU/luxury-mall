import { Router } from 'express'
import {
  getProvinces,
  getCities,
  getDistricts
} from '../controllers/region.controller'

const router = Router()

router.get('/provinces', getProvinces)
router.get('/provinces/:provinceCode/cities', getCities)
router.get('/provinces/:provinceCode/cities/:cityCode/districts', getDistricts)

export default router


