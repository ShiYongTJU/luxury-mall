import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../services/product.service'
import { AppError } from '../middleware/errorHandler'

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = req.query.category as string | undefined
    const products = await ProductService.getAllProducts(category)
    res.json(products)
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




