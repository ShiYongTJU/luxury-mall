import { Request, Response, NextFunction } from 'express'
import { Database } from '../database/db'

// 获取所有省份
export const getProvinces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regions = await Database.getRegions()
    const provinces = regions.map(province => ({
      code: province.code,
      name: province.name
    }))
    res.json(provinces)
  } catch (error) {
    next(error)
  }
}

// 根据省份代码获取城市列表
export const getCities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { provinceCode } = req.params
    const regions = await Database.getRegions()
    const province = regions.find(p => p.code === provinceCode)
    
    if (!province) {
      return res.json([])
    }
    
    const cities = province.children?.map((city: any) => ({
      code: city.code,
      name: city.name
    })) || []
    
    res.json(cities)
  } catch (error) {
    next(error)
  }
}

// 根据城市代码获取区县列表
export const getDistricts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { provinceCode, cityCode } = req.params
    const regions = await Database.getRegions()
    const province = regions.find(p => p.code === provinceCode)
    
    if (!province) {
      return res.json([])
    }
    
    const city = province.children?.find((c: any) => c.code === cityCode)
    
    if (!city) {
      return res.json([])
    }
    
    const districts = city.children?.map((district: any) => ({
      code: district.code,
      name: district.name
    })) || []
    
    res.json(districts)
  } catch (error) {
    next(error)
  }
}

