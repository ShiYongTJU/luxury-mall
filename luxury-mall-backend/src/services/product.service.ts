import { Product, Category, HomePageData } from '../types/product'
import { Database } from '../database/db'

export class ProductService {
  // 获取所有商品
  static async getAllProducts(category?: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const products = await Database.getProducts()
    
    if (category) {
      return products.filter(p => p.category === category)
    }
    return products
  }

  // 查询商品（支持多条件查询和分页）
  static async queryProducts(options: {
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
  }): Promise<{
    products: Product[]
    total: number
    page: number
    pageSize: number
  }> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 如果使用数据库，调用数据库查询函数
    if (process.env.USE_DATABASE === 'true') {
      const { queryProducts } = await import('../database/pg-db')
      return await queryProducts(options)
    }
    
    // 否则从 JSON 文件读取并过滤
    const products = await Database.getProducts()
    let filteredProducts = products

    if (options.name) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(options.name!.toLowerCase())
      )
    }
    if (options.category) {
      filteredProducts = filteredProducts.filter(p => p.category === options.category)
    }
    if (options.subCategory) {
      filteredProducts = filteredProducts.filter(p =>
        p.subCategory?.toLowerCase().includes(options.subCategory!.toLowerCase())
      )
    }
    if (options.brand) {
      filteredProducts = filteredProducts.filter(p =>
        p.brand?.toLowerCase().includes(options.brand!.toLowerCase())
      )
    }
    if (options.tag) {
      filteredProducts = filteredProducts.filter(p =>
        p.tag?.toLowerCase().includes(options.tag!.toLowerCase())
      )
    }
    if (options.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= options.minPrice!)
    }
    if (options.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= options.maxPrice!)
    }
    if (options.stock !== undefined && options.stock !== null) {
      filteredProducts = filteredProducts.filter(p =>
        p.stock !== undefined && p.stock >= options.stock!
      )
    }

    const total = filteredProducts.length
    const page = options.page || 1
    const pageSize = options.pageSize || 10
    const start = (page - 1) * pageSize
    const end = start + pageSize

    return {
      products: filteredProducts.slice(start, end),
      total,
      page,
      pageSize
    }
  }

  // 根据 ID 获取商品
  static async getProductById(id: string): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return await Database.getProductById(id)
  }

  // 搜索商品（模糊搜索）
  static async searchProducts(keyword: string): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    if (!keyword || keyword.trim() === '') {
      return []
    }
    
    const products = await Database.getProducts()
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
    return await Database.getCategories()
  }

  // 获取首页数据
  static async getHomePageData(): Promise<HomePageData> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return await Database.getHomePageData()
  }

  // 更新商品
  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 如果使用数据库，调用数据库更新函数
    if (process.env.USE_DATABASE === 'true') {
      const { updateProduct } = await import('../database/pg-db')
      return await updateProduct(id, updates)
    }
    
    // 否则从 JSON 文件更新（需要实现）
    // 这里暂时返回 null，因为 JSON 文件更新需要重新实现
    throw new Error('JSON file update not implemented, please use database')
  }

  // 新增商品
  static async addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 如果使用数据库，调用数据库新增函数
    if (process.env.USE_DATABASE === 'true') {
      const { addProduct } = await import('../database/pg-db')
      return await addProduct(product)
    }
    
    // 否则从 JSON 文件新增（需要实现）
    throw new Error('JSON file add not implemented, please use database')
  }
}




