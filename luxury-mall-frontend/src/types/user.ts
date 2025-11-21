export interface User {
  id: string
  username: string
  phone: string
  email?: string
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
  user: User
  token: string
}


