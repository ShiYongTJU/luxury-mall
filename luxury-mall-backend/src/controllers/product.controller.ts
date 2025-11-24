import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../services/product.service'
import { AppError } from '../middleware/errorHandler'

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 支持多参数查询
    const {
      name,
      category,
      subCategory,
      brand,
      tag,
      minPrice,
      maxPrice,
      stock,
      page,
      pageSize
    } = req.query

    // 如果没有任何查询参数，使用旧的接口（向后兼容）
    if (!name && !category && !subCategory && !brand && !tag && 
        minPrice === undefined && maxPrice === undefined && stock === undefined &&
        page === undefined && pageSize === undefined) {
      const products = await ProductService.getAllProducts(category as string | undefined)
      return res.json(products)
    }

    // 使用新的查询接口（支持多条件和分页）
    const result = await ProductService.queryProducts({
      name: name as string | undefined,
      category: category as string | undefined,
      subCategory: subCategory as string | undefined,
      brand: brand as string | undefined,
      tag: tag as string | undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      stock: stock !== undefined && stock !== null ? Number(stock) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined
    })

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params
    const product = await ProductService.getProductById(id)
    
    if (!product) {
      const error: AppError = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(product)
  } catch (error) {
    next(error)
  }
}

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await ProductService.getCategories()
    res.json(categories)
  } catch (error) {
    next(error)
  }
}

export const getHomePageData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await ProductService.getHomePageData()
    res.json(data)
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 支持两种方式：路径参数或请求体中的 id
    const id = req.params.id || req.body.id
    const updates = req.body as Partial<Product>
    
    if (!id) {
      const error: AppError = new Error('Product ID is required')
      error.statusCode = 400
      throw error
    }
    
    // 从 updates 中移除 id（如果存在）
    const { id: _, ...updateFields } = updates
    
    const product = await ProductService.updateProduct(id, updateFields)
    
    if (!product) {
      const error: AppError = new Error('Product not found')
      error.statusCode = 404
      throw error
    }
    
    res.json(product)
  } catch (error) {
    next(error)
  }
}




