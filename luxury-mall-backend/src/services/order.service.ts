import { Order } from '../types/address'
import { Database } from '../database/db'

export class OrderService {
  // 创建订单
  static async createOrder(order: Omit<Order, 'id' | 'orderNo' | 'createTime' | 'userId'>, userId: string): Promise<Order> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newOrder: Order = {
      ...order,
      userId,
      id: `order-${Date.now()}`,
      orderNo: `ORD${Date.now()}`,
      createTime: new Date().toISOString()
    }
    
    if (process.env.USE_DATABASE === 'true') {
      await Database.addOrderAsync(newOrder)
    } else {
      Database.addOrder(newOrder)
    }
    return newOrder
  }

  // 获取用户订单列表
  static async getOrders(userId: string): Promise<Order[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (process.env.USE_DATABASE === 'true') {
      return await Database.getOrdersAsync(userId)
    }
    return Database.getOrders(userId)
  }

  // 根据 ID 获取订单（验证用户权限）
  static async getOrderById(id: string, userId: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (process.env.USE_DATABASE === 'true') {
      return await Database.getOrderByIdAsync(id, userId)
    }
    return Database.getOrderById(id, userId)
  }

  // 支付订单
  static async payOrder(id: string, userId: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const order = process.env.USE_DATABASE === 'true'
      ? await Database.getOrderByIdAsync(id, userId)
      : Database.getOrderById(id, userId)
    if (!order) {
      return null
    }
    
    if (order.status !== 'pending') {
      throw new Error('订单状态不允许支付')
    }
    
    const updatedOrder: Order = {
      ...order,
      status: 'paid',
      payTime: new Date().toISOString()
    }
    
    if (process.env.USE_DATABASE === 'true') {
      await Database.updateOrderAsync(updatedOrder, userId)
    } else {
      Database.updateOrder(updatedOrder, userId)
    }
    return updatedOrder
  }

  // 取消订单
  static async cancelOrder(id: string, userId: string): Promise<Order | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const order = process.env.USE_DATABASE === 'true'
      ? await Database.getOrderByIdAsync(id, userId)
      : Database.getOrderById(id, userId)
    if (!order) {
      return null
    }
    
    if (order.status === 'delivered' || order.status === 'cancelled') {
      throw new Error('订单状态不允许取消')
    }
    
    const updatedOrder: Order = {
      ...order,
      status: 'cancelled'
    }
    
    if (process.env.USE_DATABASE === 'true') {
      await Database.updateOrderAsync(updatedOrder, userId)
    } else {
      Database.updateOrder(updatedOrder, userId)
    }
    return updatedOrder
  }
}




