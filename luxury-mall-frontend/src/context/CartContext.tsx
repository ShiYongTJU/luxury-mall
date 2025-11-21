import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Product } from '@/types/product'

export interface SelectedSpecValue {
  id: string
  label: string
  specName: string
}

export interface CartItem {
  uid: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  selectedSpecs?: Record<string, SelectedSpecValue>
}

interface AddCartItemPayload {
  product: Product
  quantity?: number
  selectedSpecs?: Record<string, SelectedSpecValue>
}

interface CartContextValue {
  items: CartItem[]
  totalQuantity: number
  addItem: (payload: AddCartItemPayload) => void
  updateQuantity: (uid: string, quantity: number) => void
  removeItem: (uid: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = 'luxury-mall-cart'

const buildUid = (productId: string, selectedSpecs?: Record<string, SelectedSpecValue>) => {
  if (!selectedSpecs || Object.keys(selectedSpecs).length === 0) {
    return `${productId}-default`
  }

  const parts = Object.values(selectedSpecs)
    .sort((a, b) => a.specName.localeCompare(b.specName))
    .map(({ specName, id }) => `${specName}:${id}`)

  return `${productId}-${parts.join('|')}`
}

const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.warn('读取购物车数据失败', error)
    return []
  }
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(readCartFromStorage)

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback(({ product, quantity = 1, selectedSpecs }: AddCartItemPayload) => {
    if (!product) return

    const uid = buildUid(product.id, selectedSpecs)

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.uid === uid)

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        }
        return updated
      }

      return [
        ...prev,
        {
          uid,
          productId: product.id,
          name: product.name,
          image: product.images?.[0] || product.image,
          price: product.price,
          quantity,
          selectedSpecs
        }
      ]
    })
  }, [])

  const updateQuantity = useCallback((uid: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((item) => (item.uid === uid ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((uid: string) => {
    setItems((prev) => prev.filter((item) => item.uid !== uid))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      addItem,
      updateQuantity,
      removeItem,
      clearCart
    }),
    [items, totalQuantity, addItem, updateQuantity, removeItem, clearCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart必须在CartProvider中使用')
  }
  return context
}



