// 数据库模型定义
export interface UserModel {
  id: string
  username: string
  phone: string
  email?: string
  password: string
  create_time: Date
  update_time: Date
}

export interface AddressModel {
  id: string
  user_id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
  tag?: string
  create_time: Date
  update_time: Date
}

export interface OrderModel {
  id: string
  user_id: string
  order_no: string
  total_price: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  create_time: Date
  pay_time?: Date
  ship_time?: Date
  deliver_time?: Date
}

export interface OrderItemModel {
  id: string
  order_id: string
  product_id: string
  name: string
  image: string
  price: number
  quantity: number
  selected_specs?: string // JSON string
}

export interface AddressInOrderModel {
  id: string
  order_id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
  tag?: string
}

export interface ProductModel {
  id: string
  name: string
  description?: string
  image: string
  price: number
  original_price?: number
  tag?: string
  category?: string
  sub_category?: string
  brand?: string
  images?: string // JSON array as string
  detail_description?: string
  highlights?: string // JSON array as string
  specs?: string // JSON array as string
  reviews?: string // JSON array as string
  services?: string // JSON array as string
  shipping_info?: string
  stock?: number
  create_time?: Date
  update_time?: Date
}

export interface CategoryModel {
  id: string
  name: string
  code: string
  parent_id?: string
  level: number
  sort_order: number
}

export interface RegionModel {
  code: string
  name: string
  parent_code?: string
  level: number
}


