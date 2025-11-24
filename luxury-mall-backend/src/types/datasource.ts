// 数据源类型
export type DataSourceType = 'carousel' | 'seckill' | 'groupbuy' | 'productList' | 'guessYouLike'

// 数据源基础接口
export interface DataSourceItem {
  id: string
  name: string
  config?: string // JSON字符串
  data: string // JSON字符串
  sortOrder: number
  isEnabled: boolean
  createTime?: string
  updateTime?: string
}

// 数据源查询参数
export interface DataSourceQueryParams {
  id?: string
  name?: string
  isEnabled?: boolean
  page?: number
  pageSize?: number
}

// 数据源列表响应
export interface DataSourceListResponse {
  items: DataSourceItem[]
  total: number
  page: number
  pageSize: number
}

// 创建数据源数据
export interface CreateDataSourceData {
  name: string
  dataSourceType: DataSourceType
  abbreviation: string // 两个大写首字母
  config?: string
  data: string
  sortOrder?: number
  isEnabled?: boolean
}

// 更新数据源数据
export interface UpdateDataSourceData {
  name?: string
  config?: string
  data?: string
  sortOrder?: number
  isEnabled?: boolean
}

// 轮播图项数据结构
export interface CarouselItemData {
  id: string
  image: string
  title?: string
  link?: string
  productId?: string // 如果来自商品，存储商品ID
}

import { Product } from './product'

// 秒杀数据结构
export interface SeckillData {
  endTime?: string
  products: Product[] // 完整商品对象数组
}

// 团购数据结构
export interface GroupbuyData {
  groupSize?: number
  products: Product[] // 完整商品对象数组
}

// 商品列表数据结构
export interface ProductListData {
  category?: string
  subCategory?: string
  products: Product[] // 完整商品对象数组
}

// 猜你喜欢数据结构
export interface GuessYouLikeData {
  count?: number
  products: Product[] // 完整商品对象数组
}

