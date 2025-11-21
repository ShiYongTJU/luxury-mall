export interface User {
  id: string
  username: string
  phone: string
  email?: string
  password: string // 存储加密后的密码
  createTime: string
  updateTime: string
}

export interface RegisterData {
  username: string
  phone: string
  email?: string
  password: string
}

export interface LoginData {
  phone: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}


