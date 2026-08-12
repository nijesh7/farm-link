import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Leaf, ShoppingCart, Heart, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const { savedProducts } = useWishlist();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (err) {
      showToast('Logout failed', 'error');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <Leaf size={28} fill="var(--primary)" color="var(--primary)" />
          <span>FarmLink</span>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Products</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
          <NavLink to="/faq" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>FAQ</NavLink>
        </div>

        {/* Desktop actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center' }}>
          {currentUser?.role === 'customer' && (
            <Link to="/saved-items" className="nav-cart-btn" aria-label="Saved items" title="Saved items">
              <Heart size={21} />
              {savedProducts.length > 0 && <span className="cart-count">{savedProducts.length}</span>}
            </Link>
          )}
          {currentUser?.role === 'customer' && (
            <Link to="/cart" className="nav-cart-btn" aria-label="Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
          )}

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-only-flex">
              <Link 
                to={currentUser.role === 'farmer' ? '/farmer' : '/customer'} 
                className="btn btn-outline btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <User size={16} />
                <span>Dashboard</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <LogOut size={16} />
                <span className="desktop-text">Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-only-flex">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            style={{ padding: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-drawer" 
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--white)',
            borderBottom: '1px solid var(--gray-200)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            zIndex: 99,
            boxShadow: 'var(--shadow-md)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <NavLink to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Products</NavLink>
          <NavLink to="/about" className="nav-link" onClick={() => setMobileMenuOpen(false)}>About</NavLink>
          <NavLink to="/contact" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/faq" className="nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</NavLink>
          <NavLink to="/farmer-guide" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Farmer Guide</NavLink>
          {currentUser?.role === 'customer' && <NavLink to="/saved-items" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Saved Items</NavLink>}
          
          <div style={{ height: '1px', backgroundColor: 'var(--gray-100)', margin: '0.5rem 0' }}></div>
          
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to={currentUser.role === 'farmer' ? '/farmer' : '/customer'} 
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 992px) {
          .desktop-only-flex {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
