// 页面类型
export type PageType = 'homepage' | 'category'

// 最近操作类型
export type LastOperationType = 'edit' | 'operate' | 'publish'

// 页面数据
export interface Page {
  id: string
  name: string
  pageType: PageType
  dataSource?: string // JSON字符串，存储页面配置数据
  isPublished: boolean
  createTime?: string
  lastOperationTime?: string
  lastOperationType?: LastOperationType
}

// 页面查询参数
export interface PageQueryParams {
  name?: string
  pageType?: PageType
  isPublished?: boolean
  page?: number
  pageSize?: number
}

// 页面列表响应
export interface PageListResponse {
  pages: Page[]
  total: number
  page: number
  pageSize: number
}

// 创建页面数据
export interface CreatePageData {
  name: string
  pageType: PageType
}

// 更新页面数据
export interface UpdatePageData {
  name?: string
  pageType?: PageType
}

