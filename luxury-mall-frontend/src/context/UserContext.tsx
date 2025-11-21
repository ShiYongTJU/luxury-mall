import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { User } from '@/types/user'
import { login as loginAPI, register as registerAPI, getCurrentUser } from '@/api/api'
import { toast } from '@/components/basic/Toast/Toast'

interface UserContextValue {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (phone: string, password: string) => Promise<void>
  register: (username: string, phone: string, password: string, email?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextValue | undefined>(undefined)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user'

const readTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }
  return localStorage.getItem(TOKEN_KEY)
}

const readUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.warn('读取用户数据失败', error)
    return null
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(readUserFromStorage)
  const [token, setToken] = useState<string | null>(readTokenFromStorage)
  const [loading, setLoading] = useState(true)

  // 初始化时验证token并获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = readTokenFromStorage()
      if (storedToken) {
        try {
          const userData = await getCurrentUser()
          setUser(userData)
          setToken(storedToken)
        } catch (error) {
          // token无效，清除存储
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  // 保存token和用户信息到localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }, [token])

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [user])

  const login = useCallback(async (phone: string, password: string) => {
    try {
      const response = await loginAPI({ phone, password })
      setUser(response.user)
      setToken(response.token)
      toast.success('登录成功')
    } catch (error: any) {
      console.error('登录失败:', error)
      toast.error(error.message || '登录失败，请检查手机号和密码')
      throw error
    }
  }, [])

  const register = useCallback(async (username: string, phone: string, password: string, email?: string) => {
    try {
      const response = await registerAPI({ username, phone, password, email })
      setUser(response.user)
      setToken(response.token)
      toast.success('注册成功')
    } catch (error: any) {
      console.error('注册失败:', error)
      toast.error(error.message || '注册失败，请稍后再试')
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    toast.success('已退出登录')
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // token可能已过期，清除登录状态
      logout()
    }
  }, [token, logout])

  const isAuthenticated = useMemo(() => !!user && !!token, [user, token])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      refreshUser
    }),
    [user, token, isAuthenticated, loading, login, register, logout, refreshUser]
  )

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser必须在UserProvider中使用')
  }
  return context
}

