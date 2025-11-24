import { Address } from '../types/address'
import { Database } from '../database/db'

export class AddressService {
  // 获取用户的所有地址
  static async getAddresses(userId: string): Promise<Address[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (process.env.USE_DATABASE === 'true') {
      return await Database.getAddressesAsync(userId)
    }
    return Database.getAddresses(userId)
  }

  // 根据 ID 获取地址（验证用户权限）
  static async getAddressById(id: string, userId: string): Promise<Address | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    if (process.env.USE_DATABASE === 'true') {
      return await Database.getAddressByIdAsync(id, userId)
    }
    return Database.getAddressById(id, userId)
  }

  // 创建地址
  static async createAddress(addressData: Omit<Address, 'id' | 'userId'>, userId: string): Promise<Address> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 如果设置为默认地址，取消该用户的其他默认地址
    if (addressData.isDefault) {
      const addresses = process.env.USE_DATABASE === 'true'
        ? await Database.getAddressesAsync(userId)
        : Database.getAddresses(userId)
      for (const addr of addresses) {
        if (addr.isDefault) {
          if (process.env.USE_DATABASE === 'true') {
            await Database.updateAddressAsync(addr.id, { isDefault: false }, userId)
          } else {
            Database.updateAddress(addr.id, { isDefault: false }, userId)
          }
        }
      }
    }
    
    const newAddress: Address = {
      ...addressData,
      userId,
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    }
    
    if (process.env.USE_DATABASE === 'true') {
      await Database.addAddressAsync(newAddress)
    } else {
      Database.addAddress(newAddress)
    }
    return newAddress
  }

  // 更新地址
  static async updateAddress(id: string, updates: Partial<Address>, userId: string): Promise<Address | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 如果设置为默认地址，取消该用户的其他默认地址
    if (updates.isDefault) {
      const addresses = process.env.USE_DATABASE === 'true'
        ? await Database.getAddressesAsync(userId)
        : Database.getAddresses(userId)
      for (const addr of addresses) {
        if (addr.isDefault && addr.id !== id) {
          if (process.env.USE_DATABASE === 'true') {
            await Database.updateAddressAsync(addr.id, { isDefault: false }, userId)
          } else {
            Database.updateAddress(addr.id, { isDefault: false }, userId)
          }
        }
      }
    }
    
    if (process.env.USE_DATABASE === 'true') {
      return await Database.updateAddressAsync(id, updates, userId)
    }
    return Database.updateAddress(id, updates, userId)
  }

  // 删除地址
  static async deleteAddress(id: string, userId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200))
    if (process.env.USE_DATABASE === 'true') {
      return await Database.deleteAddressAsync(id, userId)
    }
    return Database.deleteAddress(id, userId)
  }

  // 设置默认地址
  static async setDefaultAddress(id: string, userId: string): Promise<Address | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // 取消该用户的所有默认地址
    const addresses = process.env.USE_DATABASE === 'true'
      ? await Database.getAddressesAsync(userId)
      : Database.getAddresses(userId)
    for (const addr of addresses) {
      if (addr.isDefault) {
        if (process.env.USE_DATABASE === 'true') {
          await Database.updateAddressAsync(addr.id, { isDefault: false }, userId)
        } else {
          Database.updateAddress(addr.id, { isDefault: false }, userId)
        }
      }
    }
    
    // 设置新的默认地址
    if (process.env.USE_DATABASE === 'true') {
      return await Database.updateAddressAsync(id, { isDefault: true }, userId)
    }
    return Database.updateAddress(id, { isDefault: true }, userId)
  }
}

