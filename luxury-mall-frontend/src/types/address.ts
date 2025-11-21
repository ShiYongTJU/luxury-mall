export interface Address {
  id: string
  userId?: string // 用户ID（前端可选，后端会自动添加）
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
  tag?: string // 标签：家、公司、学校等
}

export interface Order {
  id: string
  orderNo: string
  items: OrderItem[]
  address: Address
  totalPrice: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  createTime: string
  payTime?: string
  shipTime?: string
  deliverTime?: string
}

export interface OrderItem {
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  selectedSpecs?: Record<string, { id: string; label: string; specName: string }>
}


