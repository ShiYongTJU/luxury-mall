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

const router = Router()

router.get('/', getPages)
router.get('/:id', getPageById)
router.post('/', createPage)
router.put('/:id', updatePage)
router.patch('/:id', updatePage)
router.post('/:id/publish', publishPage)
router.post('/:id/operate', operatePage)
router.delete('/:id', deletePage)

export default router

