export interface Image {
  id: string
  name: string
  url: string
  description?: string
  category?: string
  tags?: string
  width?: number
  height?: number
  size?: number
  format?: string
  uploadTime?: string
  updateTime?: string
}

export interface ImageQueryParams {
  name?: string
  category?: string
  tags?: string
  format?: string
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  minSize?: number
  maxSize?: number
  startTime?: string
  endTime?: string
  page?: number
  pageSize?: number
}

export interface ImageListResponse {
  images: Image[]
  total: number
  page: number
  pageSize: number
}

