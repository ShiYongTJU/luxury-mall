import { useEffect, useState } from 'react'
import './Toast.css'

export interface ToastOptions {
  message: string
  duration?: number
  type?: 'success' | 'error' | 'info' | 'warning'
}

interface ToastItem extends ToastOptions {
  id: string
}

let toastId = 0
const toastListeners: Array<(toasts: ToastItem[]) => void> = []
let toastQueue: ToastItem[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...toastQueue]))
}

export const toast = {
  show: (options: ToastOptions) => {
    const id = `toast-${++toastId}`
    const toastItem: ToastItem = {
      id,
      message: options.message,
      duration: options.duration ?? 2000,
      type: options.type ?? 'info'
    }

    toastQueue.push(toastItem)
    notifyListeners()

    const duration = toastItem.duration ?? 2000
    if (duration > 0) {
      setTimeout(() => {
        toastQueue = toastQueue.filter((item) => item.id !== id)
        notifyListeners()
      }, duration)
    }
  },
  success: (message: string, duration?: number) => {
    toast.show({ message, type: 'success', duration })
  },
  error: (message: string, duration?: number) => {
    toast.show({ message, type: 'error', duration })
  },
  info: (message: string, duration?: number) => {
    toast.show({ message, type: 'info', duration })
  },
  warning: (message: string, duration?: number) => {
    toast.show({ message, type: 'warning', duration })
  }
}

const ToastContainer = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => {
      setToasts(newToasts)
    }
    toastListeners.push(listener)
    setToasts([...toastQueue])

    return () => {
      const index = toastListeners.indexOf(listener)
      if (index > -1) {
        toastListeners.splice(index, 1)
      }
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="toast-container">
      {toasts.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`}>
          <span className="toast-message">{item.message}</span>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer

