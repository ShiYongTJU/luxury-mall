import { DataSourceType } from '../types/datasource'

// 数据源类型到缩写的映射（保证唯一性）
const DATA_SOURCE_ABBREVIATIONS: Record<DataSourceType, string> = {
  carousel: 'CA',
  seckill: 'SE',
  groupbuy: 'GB',
  productList: 'PL',
  guessYouLike: 'GY'
}

// 获取数据源类型的缩写
export function getDataSourceAbbreviation(type: DataSourceType): string {
  return DATA_SOURCE_ABBREVIATIONS[type]
}

