// 地区数据 - 使用本地数据
// 从本地 regions.json 文件读取省市区数据（包括香港、澳门、台湾）

import regionsData from './regions.json'

export interface Region {
  code: string
  name: string
}

interface RegionData {
  code: string
  name: string
  children?: RegionData[]
}

// 获取所有省份
export const getProvinces = async (): Promise<Region[]> => {
  return (regionsData as RegionData[]).map(province => ({
    code: province.code,
    name: province.name
  }))
}

// 根据省份代码获取城市列表
export const getCities = async (provinceCode: string): Promise<Region[]> => {
  const province = (regionsData as RegionData[]).find(p => p.code === provinceCode)
  if (!province || !province.children) {
    return []
  }
  return province.children.map(city => ({
    code: city.code,
    name: city.name
  }))
}

// 根据省份和城市代码获取区县列表
export const getDistricts = async (provinceCode: string, cityCode: string): Promise<Region[]> => {
  const province = (regionsData as RegionData[]).find(p => p.code === provinceCode)
  if (!province || !province.children) {
    return []
  }
  const city = province.children.find(c => c.code === cityCode)
  if (!city || !city.children) {
    return []
  }
  return city.children.map(district => ({
    code: district.code,
    name: district.name
  }))
}
