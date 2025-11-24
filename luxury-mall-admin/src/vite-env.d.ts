/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_BACKEND_URL?: string // 后端基础URL，用于构建完整的图片访问链接（已废弃，使用 VITE_IMAGE_BASE_URL）
  readonly VITE_IMAGE_BASE_URL?: string // 图片URL基础地址，用于构建完整的图片访问链接（生产环境应使用实际服务器地址）
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

