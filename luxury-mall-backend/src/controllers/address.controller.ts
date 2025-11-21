import { Request, Response, NextFunction } from 'express'
import { AddressService } from '../services/address.service'
import { AppError } from '../middleware/errorHandler'
import { Address } from '../types/address'

// 获取所有地址
export const getAddresses = async (
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
    const addresses = await AddressService.getAddresses(req.userId)
    res.json(addresses)
  } catch (error) {
    next(error)
  }
}

// 根据 ID 获取地址
export const getAddressById = async (
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
    const address = await AddressService.getAddressById(id, req.userId)
    
    if (!address) {
      const error: AppError = new Error('Address not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(address)
  } catch (error) {
    next(error)
  }
}

// 创建地址
export const createAddress = async (
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
    const addressData = req.body as Omit<Address, 'id' | 'userId'>
    
    // 验证必填字段
    if (!addressData.name || !addressData.phone || !addressData.province || 
        !addressData.city || !addressData.district || !addressData.detail) {
      const error: AppError = new Error('All required fields must be provided')
      error.statusCode = 400
      throw error
    }
    
    const address = await AddressService.createAddress(addressData, req.userId)
    res.status(201).json(address)
  } catch (error) {
    next(error)
  }
}

// 更新地址
export const updateAddress = async (
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
    const updates = req.body as Partial<Address>
    
    const address = await AddressService.updateAddress(id, updates, req.userId)
    
    if (!address) {
      const error: AppError = new Error('Address not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(address)
  } catch (error) {
    next(error)
  }
}

// 删除地址
export const deleteAddress = async (
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
    const success = await AddressService.deleteAddress(id, req.userId)
    
    if (!success) {
      const error: AppError = new Error('Address not found')
      error.statusCode = 404
      throw error
    }
    
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// 设置默认地址
export const setDefaultAddress = async (
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
    const address = await AddressService.setDefaultAddress(id, req.userId)
    
    if (!address) {
      const error: AppError = new Error('Address not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(address)
  } catch (error) {
    next(error)
  }
}

