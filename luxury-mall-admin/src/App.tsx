import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppLayout from './components/Layout/AppLayout'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import { getCurrentAdminUser, getCurrentPermissions, adminLogout } from './api/auth'
import { Spin } from 'antd'

// 全局标记，记录是否已经获取过权限（避免重复获取）
let globalPermissionsFetched = false
let globalPermissionsFetching = false

// 导出重置函数，用于登录成功后重置标记
export const resetPermissionsFetchFlag = () => {
  globalPermissionsFetched = false
  globalPermissionsFetching = false
}

// 路由守卫组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        setIsAuthenticated(false)
        setLoading(false)
        return
      }

      // 如果已经获取过权限，直接通过
      if (globalPermissionsFetched) {
        setIsAuthenticated(true)
        setLoading(false)
        return
      }

      // 如果正在获取权限，等待
      if (globalPermissionsFetching) {
        // 等待权限获取完成
        const checkInterval = setInterval(() => {
          if (globalPermissionsFetched) {
            setIsAuthenticated(true)
            setLoading(false)
            clearInterval(checkInterval)
          }
        }, 100)
        
        // 最多等待5秒
        setTimeout(() => {
          clearInterval(checkInterval)
          if (!globalPermissionsFetched) {
            setLoading(false)
          }
        }, 5000)
        
        return
      }

      try {
        // 检查是否已有权限信息
        const existingPermissions = getCurrentPermissions()
        
        if (existingPermissions.length > 0) {
          // 已有权限信息，后台静默更新，不阻塞页面渲染
          setIsAuthenticated(true)
          setLoading(false)
          globalPermissionsFetched = true
          
          // 后台更新权限
          globalPermissionsFetching = true
          getCurrentAdminUser()
            .then(() => {
              globalPermissionsFetching = false
            })
            .catch((error: any) => {
              console.error('后台更新权限失败:', error)
              globalPermissionsFetching = false
              if (error.response?.status === 401) {
                adminLogout()
                globalPermissionsFetched = false
                setIsAuthenticated(false)
              }
            })
          return
        }

        // 如果没有权限信息，需要获取
        globalPermissionsFetching = true
        await getCurrentAdminUser()
        setIsAuthenticated(true)
        globalPermissionsFetched = true
        globalPermissionsFetching = false
      } catch (error: any) {
        console.error('获取用户权限失败:', error)
        adminLogout()
        setIsAuthenticated(false)
        globalPermissionsFetched = false
        globalPermissionsFetching = false
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/register" element={<Register />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/admin/operation/page" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

