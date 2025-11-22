import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { CartProvider } from './context/CartContext'
import { AddressProvider } from './context/AddressContext'
import { UserProvider } from './context/UserContext'
import { ThemeProvider } from './context/ThemeContext'
import ToastContainer from './components/basic/Toast/Toast'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <UserProvider>
        <CartProvider>
          <AddressProvider>
            <App />
            <ToastContainer />
          </AddressProvider>
        </CartProvider>
      </UserProvider>
    </ThemeProvider>
  </React.StrictMode>
)



