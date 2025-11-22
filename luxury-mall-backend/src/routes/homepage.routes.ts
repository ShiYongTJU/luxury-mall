import { Router } from 'express'
import {
  getHomepageComponents,
  getHomepageComponent,
  createHomepageComponent,
  updateHomepageComponent,
  deleteHomepageComponent,
  updateComponentsOrder
} from '../controllers/homepage.controller'
import {
  getCategoryComponents,
  getCategoryComponent,
  createCategoryComponent,
  updateCategoryComponent,
  deleteCategoryComponent,
  updateCategoryComponentsOrder
} from '../controllers/category.controller'

const router = Router()

// 首页组件配置
// 获取所有组件配置
router.get('/components', getHomepageComponents)

// 获取单个组件配置
router.get('/components/:id', getHomepageComponent)

// 创建组件配置
router.post('/components', createHomepageComponent)

// 更新组件配置
router.put('/components/:id', updateHomepageComponent)

// 删除组件配置
router.delete('/components/:id', deleteHomepageComponent)

// 批量更新组件顺序
router.put('/components/order', updateComponentsOrder)

// 分类页组件配置
// 获取所有分类页组件配置
router.get('/category-components', getCategoryComponents)

// 获取单个分类页组件配置
router.get('/category-components/:id', getCategoryComponent)

// 创建分类页组件配置
router.post('/category-components', createCategoryComponent)

// 更新分类页组件配置
router.put('/category-components/:id', updateCategoryComponent)

// 删除分类页组件配置
router.delete('/category-components/:id', deleteCategoryComponent)

// 批量更新分类页组件顺序
router.put('/category-components/order', updateCategoryComponentsOrder)

export default router

