import { ReactNode } from 'react'
import TabBar from '../TabBar/TabBar'
import ToastContainer from '../../basic/Toast/Toast'
import ConfirmContainer from '../../basic/Confirm/Confirm'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <main className="layout-content">{children}</main>
      <TabBar />
      <ToastContainer />
      <ConfirmContainer />
    </div>
  )
}

export default Layout





