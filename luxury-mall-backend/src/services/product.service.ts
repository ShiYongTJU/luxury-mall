import { Product, Category, HomePageData } from '../types/product'
import { Database } from '../database/db'

export class ProductService {
  // 获取所有商品
  static async getAllProducts(category?: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const products = Database.getProducts()
    
    if (category) {
      return products.filter(p => p.category === category)
    }
    return products
  }

  // 根据 ID 获取商品
  static async getProductById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return Database.getProductById(id)
  }

  // 搜索商品（模糊搜索）
  static async searchProducts(keyword: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!keyword || keyword.trim() === '') {
      return []
    }
    
    const products = Database.getProducts()
    const lowerKeyword = keyword.toLowerCase().trim()
    
    return products.filter((product) => {
      if (product.name.toLowerCase().includes(lowerKeyword)) return true
      if (product.description?.toLowerCase().includes(lowerKeyword)) return true
      if (product.brand?.toLowerCase().includes(lowerKeyword)) return true
      if (product.category?.toLowerCase().includes(lowerKeyword)) return true
      if (product.subCategory?.toLowerCase().includes(lowerKeyword)) return true
      return false
    })
  }

  // 获取分类列表
  static async getCategories(): Promise<Category[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return Database.getCategories()
  }

  // 获取首页数据
  static async getHomePageData(): Promise<HomePageData> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return Database.getHomePageData()
  }
}




