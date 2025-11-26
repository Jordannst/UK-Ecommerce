import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Categories from './pages/Categories';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

// Other
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Routes>
              {/* Auth Routes (No Layout) */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Admin Routes (No Navbar/Footer, Protected) */}
              <Route path="/admin" element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute adminOnly>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute adminOnly>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute adminOnly>
                  <AdminOrders />
                </ProtectedRoute>
              } />

              {/* Main Routes (With Navbar/Footer) */}
              <Route
                path="/*"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/categories" element={<Categories />} />
                        <Route path="/about" element={<About />} />
                        
                        {/* Protected Routes - Require Login */}
                        <Route path="/cart" element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        } />
                        <Route path="/checkout" element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        } />
                        <Route path="/order-success/:orderId" element={
                          <ProtectedRoute>
                            <OrderSuccess />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/dashboard/orders" element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                          <ProtectedRoute>
                            <Wishlist />
                          </ProtectedRoute>
                        } />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                }
              />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

