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
import AiAgriCopilot from './components/AiAgriCopilot';

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

// Advanced Features Pages
import MarketTrends from './pages/MarketTrends';
import Traceability from './pages/Traceability';
import PreOrders from './pages/PreOrders';

// FarmLink 2.0 Advanced Feature Additions
import BulkMarketplace from './pages/BulkMarketplace';
import SurplusProduce from './pages/SurplusProduce';
import FarmersNearYou from './pages/FarmersNearYou';
import FarmerPublicProfile from './pages/FarmerPublicProfile';
import Subscriptions from './pages/Subscriptions';
import FarmProfitSimulator from './pages/FarmProfitSimulator';

// Protected Dashboards
import CustomerDashboard from './pages/customer/CustomerDashboard';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import FarmerOrders from './pages/farmer/FarmerOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import BuyerDashboard from './pages/buyer/BuyerDashboard';

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
                    
                    {/* Advanced Feature Routes */}
                    <Route path="/bulk-marketplace" element={<BulkMarketplace />} />
                    <Route path="/surplus-produce" element={<SurplusProduce />} />
                    <Route path="/farmers-near-you" element={<FarmersNearYou />} />
                    <Route path="/farmer-profile/:farmerId" element={<FarmerPublicProfile />} />
                    <Route path="/farmer/:farmerId" element={<FarmerPublicProfile />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/profit-simulator" element={<FarmProfitSimulator />} />

                    <Route path="/market-trends" element={<MarketTrends />} />
                    <Route path="/traceability" element={<Traceability />} />
                    <Route path="/pre-orders" element={<PreOrders />} />

                    <Route path="/cart" element={<Cart />} />
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
                        <ProtectedRoute allowedRoles={['customer', 'buyer']}>
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

                    {/* Bulk Buyer Role Routes */}
                    <Route
                      path="/buyer"
                      element={
                        <ProtectedRoute allowedRoles={['buyer', 'admin']}>
                          <BuyerDashboard />
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

                    {/* Admin Platform SuperAdmin Route */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Fallback to Home */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                </main>
                <Footer />
                {/* Floating AI AgriCopilot across all pages */}
                <AiAgriCopilot />
              </ToastProvider>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
