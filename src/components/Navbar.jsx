import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Truck, 
  ShieldCheck, 
  ChevronDown,
  TrendingUp,
  QrCode,
  CalendarCheck,
  HelpCircle,
  BookOpen,
  Info,
  Calculator
} from 'lucide-react';
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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMoreDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  }, [location.pathname]);

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

  const isMoreActive = ['/pre-orders', '/market-trends', '/traceability', '/profit-simulator', '/about', '/faq', '/farmer-guide'].some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-wrap">
            <Leaf size={24} fill="var(--primary)" color="var(--primary)" />
          </div>
          <span>FarmLink</span>
        </Link>

        {/* Center Desktop Navigation */}
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Marketplace</NavLink>
          <NavLink to="/bulk-marketplace" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Bulk B2B</NavLink>
          <NavLink to="/surplus-produce" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Surplus</NavLink>
          <NavLink to="/farmers-near-you" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Farmers Near You</NavLink>
          <NavLink to="/subscriptions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Baskets</NavLink>

          {/* More Features Dropdown */}
          <div className="nav-dropdown-wrapper" ref={dropdownRef}>
            <button 
              className={`nav-link nav-dropdown-btn ${isMoreActive ? 'active' : ''}`}
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              type="button"
            >
              <span>Explore</span>
              <ChevronDown size={14} style={{ transform: moreDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {moreDropdownOpen && (
              <div className="nav-dropdown-menu">
                <Link to="/pre-orders" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <CalendarCheck size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">CSA Pre-Orders</div>
                    <div className="dropdown-desc">Reserve upcoming seasonal harvests</div>
                  </div>
                </Link>
                <Link to="/market-trends" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <TrendingUp size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">Market Trends</div>
                    <div className="dropdown-desc">Live Mandi prices and analytics</div>
                  </div>
                </Link>
                <Link to="/traceability" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <QrCode size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">Traceability Hub</div>
                    <div className="dropdown-desc">Verify crop harvest batch origins</div>
                  </div>
                </Link>
                <Link to="/profit-simulator" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <Calculator size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">Profit Simulator</div>
                    <div className="dropdown-desc">Compare direct vs Mandi earnings</div>
                  </div>
                </Link>
                <div className="dropdown-divider"></div>
                <Link to="/about" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <Info size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">About FarmLink</div>
                    <div className="dropdown-desc">Our direct farm-to-fork mission</div>
                  </div>
                </Link>
                <Link to="/farmer-guide" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <BookOpen size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">Farmer Guide</div>
                    <div className="dropdown-desc">Best practices & onboarding</div>
                  </div>
                </Link>
                <Link to="/faq" className="nav-dropdown-item" onClick={() => setMoreDropdownOpen(false)}>
                  <HelpCircle size={16} color="var(--primary)" />
                  <div>
                    <div className="dropdown-title">FAQ</div>
                    <div className="dropdown-desc">Common questions & help</div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Desktop Actions */}
        <div className="nav-actions">
          {/* Saved Items for Customer */}
          {currentUser?.role === 'customer' && (
            <Link to="/saved-items" className="nav-cart-btn" aria-label="Saved items" title="Saved items">
              <Heart size={19} />
              {savedProducts.length > 0 && <span className="cart-count">{savedProducts.length}</span>}
            </Link>
          )}

          {/* Shopping Cart */}
          <Link to="/cart" className="nav-cart-btn" aria-label="Shopping Cart & Placed Orders" title="Shopping Cart & Placed Orders">
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>

          {/* Role Hub & Auth */}
          {currentUser ? (
            <div className="desktop-only-flex" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {currentUser.role === 'admin' ? (
                <Link 
                  to="/admin" 
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: 'var(--info)', color: 'var(--info)' }}
                  title="Platform Operations"
                >
                  <ShieldCheck size={15} />
                  <span>Admin</span>
                </Link>
              ) : currentUser.role === 'buyer' ? (
                <Link
                  to="/buyer"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#8e44ad', color: '#8e44ad' }}
                  title="Bulk Buyer Procurement Hub"
                >
                  <User size={15} />
                  <span>Buyer Hub</span>
                </Link>
              ) : currentUser.role === 'customer' ? (
                <Link 
                  to="/customer" 
                  className="btn btn-outline btn-sm"
                  title="Track Live Orders & Delivery"
                >
                  <Truck size={15} />
                  <span>Orders</span>
                </Link>
              ) : (
                <Link 
                  to="/farmer" 
                  className="btn btn-outline btn-sm"
                >
                  <User size={15} />
                  <span>Portal</span>
                </Link>
              )}

              {currentUser.role === 'farmer' && (
                <Link to="/farmer/orders" className="btn btn-outline btn-sm">Orders</Link>
              )}

              <button 
                onClick={handleLogout} 
                className="btn btn-danger btn-sm"
                title="Log out of account"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="desktop-only-flex" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            type="button"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Hamburger Mobile Toggle */}
          <button 
            className="menu-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            type="button"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <NavLink to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Home</NavLink>
          <NavLink to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Marketplace</NavLink>
          <NavLink to="/bulk-marketplace" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Bulk B2B Marketplace</NavLink>
          <NavLink to="/surplus-produce" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Surplus Produce (Discounts)</NavLink>
          <NavLink to="/farmers-near-you" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Farmers Near You</NavLink>
          <NavLink to="/subscriptions" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Farm Basket Subscriptions</NavLink>
          <NavLink to="/pre-orders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Harvest Pre-Orders (CSA)</NavLink>
          <NavLink to="/market-trends" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Market Trends & Mandi Index</NavLink>
          <NavLink to="/traceability" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Traceability Hub</NavLink>
          <NavLink to="/profit-simulator" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Farm Profit Simulator</NavLink>
          <NavLink to="/about" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>About Us</NavLink>
          <NavLink to="/farmer-guide" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Farmer Guide</NavLink>
          <NavLink to="/faq" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>FAQ</NavLink>
          
          <div style={{ height: '1px', backgroundColor: 'var(--gray-200)', margin: '0.5rem 0' }}></div>
          
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link 
                to={currentUser.role === 'admin' ? '/admin' : currentUser.role === 'buyer' ? '/buyer' : currentUser.role === 'farmer' ? '/farmer' : '/customer'} 
                className="btn btn-outline"
                style={{ width: '100%' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {currentUser.role === 'admin' ? 'Admin Console' : currentUser.role === 'buyer' ? 'Bulk Buyer Dashboard' : currentUser.role === 'farmer' ? 'Farmer Portal' : 'Customer Hub & Orders'}
              </Link>
              {currentUser.role === 'farmer' && (
                <Link to="/farmer/orders" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setMobileMenuOpen(false)}>
                  Customer Orders
                </Link>
              )}
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
    </nav>
  );
}
