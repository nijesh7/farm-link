import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Components & Guard
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Faq from './pages/Faq';
import FarmerGuide from './pages/FarmerGuide';
import Delivery from './pages/Delivery';
import Stories from './pages/Stories';
import SeasonalPicks from './pages/SeasonalPicks';
import Recipes from './pages/Recipes';
import Impact from './pages/Impact';
import SavedItems from './pages/SavedItems';

// Protected Dashboards
import CustomerDashboard from './pages/customer/CustomerDashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerOrders from './pages/farmer/FarmerOrders';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <ToastProvider>
              <Navbar />
              <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/farmer-guide" element={<FarmerGuide />} />
                  <Route path="/delivery" element={<Delivery />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/seasonal-picks" element={<SeasonalPicks />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/impact" element={<Impact />} />
                  
                  {/* Customer Role Routes */}
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/customer" 
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route
                    path="/saved-items"
                    element={
                      <ProtectedRoute allowedRoles={['customer']}>
                        <SavedItems />
                      </ProtectedRoute>
                    }
                  />

                  {/* Farmer Role Routes */}
                  <Route 
                    path="/farmer" 
                    element={
                      <ProtectedRoute allowedRoles={['farmer']}>
                        <FarmerDashboard />
                      </ProtectedRoute>
                    } 
                  /> 
                  <Route
                    path="/farmer/orders"
                    element={
                      <ProtectedRoute allowedRoles={['farmer']}>
                        <FarmerOrders />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Fallback to Home */}
                  <Route path="*" element={<Home />} />
                </Routes>
              </main>
              <Footer />
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
