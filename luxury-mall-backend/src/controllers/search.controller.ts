import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../services/product.service'

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = req.query.q as string
    
    if (!keyword) {
      return res.json([])
    }
    
    const products = await ProductService.searchProducts(keyword)
    res.json(products)
  } catch (error) {
    next(error)
  }
}




