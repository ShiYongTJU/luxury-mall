/**
 * 获取图片URL基础地址
 * 用于构建完整的图片访问链接
 * 
 * 注意：生产环境中，前端可能通过代理（localhost）访问API，
 * 但图片URL应该使用实际的服务器地址，以便其他客户端也能访问
 */
export function getImageBaseUrl(): string {
  // 优先使用专门的图片URL环境变量
  if (import.meta.env.VITE_IMAGE_BASE_URL) {
    return import.meta.env.VITE_IMAGE_BASE_URL
  }
  
  // 兼容旧的环境变量（已废弃，建议使用 VITE_IMAGE_BASE_URL）
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL
  }
  
  // 默认使用实际服务器IP和端口（开发和生产环境都使用服务器地址）
  // 这样图片URL可以在任何环境下被正确访问
  return 'http://1.15.93.186:3001'
}

/**
 * 获取后端基础URL（已废弃，保留用于兼容性）
 * @deprecated 请使用 getImageBaseUrl() 获取图片URL基础地址
 */
export function getBackendBaseUrl(): string {
  return getImageBaseUrl()
}

/**
 * 将后端返回的相对路径转换为完整的图片URL
 * 如果已经是完整URL（http:// 或 https:// 开头），则保持不变
 * 如果是相对路径（以 / 开头），则添加服务器基础URL
 */
export function getFullImageUrl(url: string): string {
  if (!url) {
    return url
  }
  
  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // 如果是相对路径，添加服务器基础URL
  if (url.startsWith('/')) {
    const baseUrl = getImageBaseUrl()
    return `${baseUrl}${url}`
  }
  
  // 如果既不是完整URL也不是相对路径，添加前缀
  const baseUrl = getImageBaseUrl()
  return `${baseUrl}/uploads/images/${url}`
}

