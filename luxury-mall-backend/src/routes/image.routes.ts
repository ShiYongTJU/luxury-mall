import { Router } from 'express'
import { getImages, getImageById, updateImage, addImage } from '../controllers/image.controller'

const router = Router()

router.get('/', getImages)
router.get('/:id', getImageById)
router.put('/:id', updateImage)
router.patch('/:id', updateImage)

export default router

