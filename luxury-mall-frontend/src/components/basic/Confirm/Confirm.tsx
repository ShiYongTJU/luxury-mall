import { useEffect, useState } from 'react'
import './Confirm.css'

export interface ConfirmOptions {
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  type?: 'warning' | 'danger' | 'info'
}

interface ConfirmItem extends ConfirmOptions {
  id: string
}

let confirmId = 0
const confirmListeners: Array<(confirm: ConfirmItem | null) => void> = []
let currentConfirm: ConfirmItem | null = null

const notifyListeners = () => {
  confirmListeners.forEach((listener) => listener(currentConfirm))
}

export const confirm = {
  show: (options: ConfirmOptions) => {
    const id = `confirm-${++confirmId}`
    const confirmItem: ConfirmItem = {
      id,
      title: options.title || '提示',
      message: options.message,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      type: options.type || 'warning'
    }

    currentConfirm = confirmItem
    notifyListeners()
  },
  close: () => {
    currentConfirm = null
    notifyListeners()
  }
}

const ConfirmContainer = () => {
  const [confirmItem, setConfirmItem] = useState<ConfirmItem | null>(null)

  useEffect(() => {
    const listener = (newConfirm: ConfirmItem | null) => {
      setConfirmItem(newConfirm)
    }
    confirmListeners.push(listener)
    setConfirmItem(currentConfirm)

    return () => {
      const index = confirmListeners.indexOf(listener)
      if (index > -1) {
        confirmListeners.splice(index, 1)
      }
    }
  }, [])

  const handleConfirm = () => {
    if (confirmItem) {
      confirmItem.onConfirm()
      confirm.close()
    }
  }

  const handleCancel = () => {
    if (confirmItem?.onCancel) {
      confirmItem.onCancel()
    }
    confirm.close()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  if (!confirmItem) return null

  return (
    <div className="confirm-overlay" onClick={handleOverlayClick}>
      <div className="confirm-dialog">
        <div className="confirm-header">
          <h3 className="confirm-title">{confirmItem.title}</h3>
        </div>
        <div className="confirm-body">
          <div className={`confirm-icon confirm-icon-${confirmItem.type}`}>
            {confirmItem.type === 'warning' && '⚠️'}
            {confirmItem.type === 'danger' && '🗑️'}
            {confirmItem.type === 'info' && 'ℹ️'}
          </div>
          <p className="confirm-message">{confirmItem.message}</p>
        </div>
        <div className="confirm-footer">
          <button
            className="confirm-btn confirm-btn-cancel"
            onClick={handleCancel}
          >
            {confirmItem.cancelText}
          </button>
          <button
            className={`confirm-btn confirm-btn-confirm confirm-btn-${confirmItem.type}`}
            onClick={handleConfirm}
          >
            {confirmItem.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmContainer

