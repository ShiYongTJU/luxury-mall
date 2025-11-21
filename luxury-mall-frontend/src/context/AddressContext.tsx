import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Address } from '@/types/address'
import {
  getAddresses as fetchAddresses,
  createAddress as createAddressAPI,
  updateAddress as updateAddressAPI,
  deleteAddress as deleteAddressAPI,
  setDefaultAddress as setDefaultAddressAPI
} from '@/api/api'
import { useUser } from './UserContext'
import { toast } from '@/components/basic/Toast/Toast'

interface AddressContextValue {
  addresses: Address[]
  defaultAddress: Address | null
  loading: boolean
  addAddress: (address: Omit<Address, 'id' | 'userId'>) => Promise<void>
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>
  deleteAddress: (id: string) => Promise<void>
  setDefaultAddress: (id: string) => Promise<void>
  getAddress: (id: string) => Address | undefined
  refreshAddresses: () => Promise<void>
}

const AddressContext = createContext<AddressContextValue | undefined>(undefined)

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: userLoading } = useUser()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(false)

  // 从API加载地址列表
  const loadAddresses = useCallback(async () => {
    // 如果未登录，不加载地址
    if (!isAuthenticated) {
      setAddresses([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await fetchAddresses()
      setAddresses(data)
    } catch (error: any) {
      // 如果是401错误（未认证），不显示错误提示，因为可能是用户未登录
      if (error.message && !error.message.includes('401') && !error.message.includes('未认证')) {
        console.error('加载地址列表失败:', error)
        toast.error('加载地址列表失败')
      }
      setAddresses([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  // 只有在用户已登录时才加载地址
  useEffect(() => {
    if (userLoading) return // 等待用户认证状态确定
    
    if (isAuthenticated) {
      loadAddresses()
    } else {
      // 未登录时清空地址列表
      setAddresses([])
      setLoading(false)
    }
  }, [isAuthenticated, userLoading, loadAddresses])

  const defaultAddress = useMemo(
    () => addresses.find(addr => addr.isDefault) || addresses[0] || null,
    [addresses]
  )

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    try {
      const newAddress = await createAddressAPI(address)
      setAddresses((prev) => {
        // 如果设置为默认地址，后端已经处理了其他默认地址的取消
        return [...prev, newAddress]
      })
      toast.success('地址添加成功')
    } catch (error) {
      console.error('添加地址失败:', error)
      toast.error('添加地址失败')
      throw error
    }
  }, [])

  const updateAddress = useCallback(async (id: string, updates: Partial<Address>) => {
    try {
      const updatedAddress = await updateAddressAPI(id, updates)
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === id ? updatedAddress : addr))
      )
      // 如果设置为默认地址，需要更新其他地址的isDefault状态
      if (updates.isDefault) {
        setAddresses((prev) =>
          prev.map((addr) =>
            addr.id === id ? updatedAddress : { ...addr, isDefault: false }
          )
        )
      }
      toast.success('地址更新成功')
    } catch (error) {
      console.error('更新地址失败:', error)
      toast.error('更新地址失败')
      throw error
    }
  }, [])

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await deleteAddressAPI(id)
      setAddresses((prev) => prev.filter((addr) => addr.id !== id))
      toast.success('地址删除成功')
    } catch (error) {
      console.error('删除地址失败:', error)
      toast.error('删除地址失败')
      throw error
    }
  }, [])

  const setDefaultAddress = useCallback(async (id: string) => {
    try {
      await setDefaultAddressAPI(id)
      // 更新所有地址的isDefault状态
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr.id === id
        }))
      )
      toast.success('默认地址设置成功')
    } catch (error) {
      console.error('设置默认地址失败:', error)
      toast.error('设置默认地址失败')
      throw error
    }
  }, [])

  const getAddress = useCallback(
    (id: string) => addresses.find((addr) => addr.id === id),
    [addresses]
  )

  const value = useMemo(
    () => ({
      addresses,
      defaultAddress,
      loading,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      getAddress,
      refreshAddresses: loadAddresses
    }),
    [addresses, defaultAddress, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress, getAddress, loadAddresses]
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}

export const useAddress = () => {
  const context = useContext(AddressContext)
  if (!context) {
    throw new Error('useAddress必须在AddressProvider中使用')
  }
  return context
}


