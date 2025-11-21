import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/business/Layout/Layout'
import Home from './pages/Home/Home'
import Category from './pages/Category/Category'
import Cart from './pages/Cart/Cart'
import Profile from './pages/Profile/Profile'
import ProductDetail from './pages/ProductDetail/ProductDetail'
import Checkout from './pages/Checkout/Checkout'
import OrderSuccess from './pages/OrderSuccess/OrderSuccess'
import Search from './pages/Search/Search'
import Orders from './pages/Orders/Orders'
import OrderDetail from './pages/OrderDetail/OrderDetail'
import Settings from './pages/Settings/Settings'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App



