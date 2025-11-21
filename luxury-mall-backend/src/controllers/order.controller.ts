import { Request, Response, NextFunction } from 'express'
import { OrderService } from '../services/order.service'
import { AppError } from '../middleware/errorHandler'
import { Order } from '../types/address'

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }
    const orderData = req.body as Omit<Order, 'id' | 'orderNo' | 'createTime' | 'userId'>
    
    if (!orderData.items || orderData.items.length === 0) {
      const error: AppError = new Error('Order items are required')
      error.statusCode = 400
      throw error
    }
    
    if (!orderData.address) {
      const error: AppError = new Error('Shipping address is required')
      error.statusCode = 400
      throw error
    }
    
    const order = await OrderService.createOrder(orderData, req.userId)
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
}

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }
    const orders = await OrderService.getOrders(req.userId)
    res.json(orders)
  } catch (error) {
    next(error)
  }
}

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }
    const { id } = req.params
    const order = await OrderService.getOrderById(id, req.userId)
    
    if (!order) {
      const error: AppError = new Error('Order not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(order)
  } catch (error) {
    next(error)
  }
}

// 支付订单
export const payOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }
    const { id } = req.params
    const order = await OrderService.payOrder(id, req.userId)
    
    if (!order) {
      const error: AppError = new Error('Order not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(order)
  } catch (error: any) {
    if (error.message) {
      const appError: AppError = error
      appError.statusCode = 400
      return next(appError)
    }
    next(error)
  }
}

// 取消订单
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      const error: AppError = new Error('未认证')
      error.statusCode = 401
      throw error
    }
    const { id } = req.params
    const order = await OrderService.cancelOrder(id, req.userId)
    
    if (!order) {
      const error: AppError = new Error('Order not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(order)
  } catch (error: any) {
    if (error.message) {
      const appError: AppError = error
      appError.statusCode = 400
      return next(appError)
    }
    next(error)
  }
}




