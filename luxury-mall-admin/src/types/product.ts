export interface Product {
  id: string
  name: string
  description?: string
  image: string
  price: number
  originalPrice?: number
  tag?: string
  category?: string
  subCategory?: string
  brand?: string
  images?: string[]
  detailDescription?: string
  highlights?: string[]
  specs?: any[]
  reviews?: any[]
  services?: string[]
  shippingInfo?: string
  stock?: number
  createTime?: string
  updateTime?: string
}

export interface ProductQueryParams {
  name?: string
  category?: string
  subCategory?: string
  brand?: string
  tag?: string
  minPrice?: number
  maxPrice?: number
  stock?: number
  page?: number
  pageSize?: number
}

