import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  ShoppingCart,
  Heart,
  Eye,
  HelpCircle,
  Mic,
  MicOff,
  Scale,
  MessageSquare,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { getProducts } from '../services/firebaseDb';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';
import ProductCompareModal from '../components/ProductCompareModal';
import FarmerChatModal from '../components/FarmerChatModal';
import NegotiationModal from '../components/NegotiationModal';
import PriceAlertModal from '../components/PriceAlertModal';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Dairy', 'Organic Products'];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { isSaved, toggleSavedProduct } = useWishlist();
  const navigate = useNavigate();
  const canShop = !currentUser || currentUser.role === 'customer';

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(500);
  const [sortBy, setSortBy] = useState('newest');

  // Selected product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailQty, setDetailQty] = useState(1);

  // Comparison Matrix state
  const [compareItems, setCompareItems] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Direct Farmer Chat modal state
  const [chatFarmer, setChatFarmer] = useState(null);

  // Negotiation & Price Alert state
  const [negotiateProduct, setNegotiateProduct] = useState(null);
  const [priceAlertProduct, setPriceAlertProduct] = useState(null);

  // Voice Search state
  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  // Load from database
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch from Firestore
    getProducts()
      .then((products) => {
        setAllProducts(products);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Update filters based on URL search query (e.g. from homepage category click)
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setCategory(catParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let result = [...allProducts];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.farmerName.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (category !== 'All') {
      result = result.filter((p) => p.category === category);
    }

    // Price filter
    result = result.filter((p) => p.price <= maxPrice);

    // Sort operations
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(result);
  }, [allProducts, search, category, maxPrice, sortBy]);

  // Web Speech Voice Search
  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice search is not supported by your browser.', 'info');
      return;
    }

    if (isVoiceSearching) {
      setIsVoiceSearching(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceSearching(true);
        showToast('Listening... Speak product name now', 'info');
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearch(transcript);
        setIsVoiceSearching(false);
        showToast(`Searching for "${transcript}"`, 'success');
      };
      recognition.onerror = () => setIsVoiceSearching(false);
      recognition.onend = () => setIsVoiceSearching(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsVoiceSearching(false);
    }
  };

  const toggleCompare = (e, product) => {
    e.stopPropagation();
    if (compareItems.some((item) => item.id === product.id)) {
      setCompareItems(compareItems.filter((item) => item.id !== product.id));
    } else {
      if (compareItems.length >= 3) {
        showToast('You can compare up to 3 produce items at a time.', 'warning');
        return;
      }
      setCompareItems([...compareItems, product]);
      showToast(`Added ${product.name} to comparison list.`, 'success');
    }
  };

  const handleAddToCart = (e, product) => {
    e?.stopPropagation();
    if (currentUser && currentUser.role !== 'customer') {
      showToast('Only customer accounts can place orders.', 'warning');
      return;
    }
    if (!currentUser) {
      showToast('Please login as a Customer to shop.', 'info');
      navigate('/login');
      return;
    }
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart.`, 'success');
  };

  const handleSaveProduct = (e, product) => {
    e.stopPropagation();
    const alreadySaved = isSaved(product.id);
    toggleSavedProduct(product);
    showToast(alreadySaved ? `${product.name} removed from saved items.` : `${product.name} saved for later.`, 'success');
  };

  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setDetailQty(1);
  };

  const closeDetailModal = () => {
    setSelectedProduct(null);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setMaxPrice(500);
    setSortBy('newest');
    navigate('/products', { replace: true });
  };

  const handleModalAddCart = () => {
    if (currentUser && currentUser.role !== 'customer') {
      showToast('Only customer accounts can buy products.', 'warning');
      return;
    }
    if (!currentUser) {
      showToast('Please login to place items in cart.', 'info');
      navigate('/login');
      return;
    }
    addToCart(selectedProduct, detailQty);
    showToast(`Added ${detailQty} ${selectedProduct.unit} of ${selectedProduct.name} to cart.`, 'success');
    closeDetailModal();
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Page title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>Direct Farm Sourcing</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Direct Farmer Marketplace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Fresh organic harvest sourced straight from verified regional gardens with zero broker commissions</p>
        </div>

        {/* Search, Filter & Sort Controls layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }} className="marketplace-grid">
          
          {/* Sidebar Filters */}
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <SlidersHorizontal size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Filter Marketplace</h3>
            </div>

            {/* Keyword Search with Voice Search */}
            <div className="form-group">
              <label className="form-label" htmlFor="search">Search Products</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  id="search" 
                  className="form-input" 
                  placeholder="e.g. Tomato, John..."
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.4rem', fontSize: '0.9rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  title={isVoiceSearching ? 'Listening...' : 'Search by Voice'}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    background: isVoiceSearching ? 'var(--danger)' : 'none',
                    border: 'none',
                    color: isVoiceSearching ? '#ffffff' : 'var(--primary)',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isVoiceSearching ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              </div>
            </div>

            {/* Price Filter */}
            <div className="form-group" style={{ margin: '2rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Price</label>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{formatINR(maxPrice)}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                <span>₹10</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Sort Filter */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="sort">Sort By</label>
              <div style={{ position: 'relative' }}>
                <ArrowUpDown size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <select 
                  id="sort" 
                  className="form-input" 
                  style={{ paddingLeft: '2.4rem', fontSize: '0.9rem', cursor: 'pointer' }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newly Harvested</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Quick feature links */}
            <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link to="/market-trends" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                📈 Live Mandi Price Index
              </Link>
              <Link to="/traceability" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔍 Farm-to-Fork Traceability
              </Link>
              <Link to="/pre-orders" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🌱 CSA Harvest Pre-Orders
              </Link>
            </div>
          </div>

          {/* Catalog Listings */}
          <div>
            {/* Category selection bar */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                overflowX: 'auto', 
                paddingBottom: '1rem', 
                marginBottom: '1.5rem',
                scrollbarWidth: 'none'
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="btn btn-sm"
                  style={{
                    backgroundColor: category === cat ? 'var(--primary)' : 'var(--white)',
                    color: category === cat ? 'var(--white)' : 'var(--text-main)',
                    border: '1px solid',
                    borderColor: category === cat ? 'var(--primary)' : 'var(--gray-200)',
                    whiteSpace: 'nowrap',
                    borderRadius: '10px'
                  }}
                  onClick={() => { setCategory(cat); navigate('/products', { replace: true }); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', margin: '-0.5rem 0 1.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </span>
              {(search || category !== 'All' || maxPrice !== 500 || sortBy !== 'newest') && (
                <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            {/* Listings Grid */}
            {filteredProducts.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Products Found</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Try adjusting your keyword query or increasing the maximum price filter.</p>
              </div>
            ) : (
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {filteredProducts.map((product) => {
                  const isCompared = compareItems.some((item) => item.id === product.id);
                  const saved = isSaved(product.id);
                  return (
                    <div 
                      key={product.id} 
                      className="card product-card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        height: '100%',
                        position: 'relative',
                        borderRadius: 'var(--radius-lg)',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Card Image */}
                      <div style={{ height: '185px', overflow: 'hidden', position: 'relative' }}>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                        <span className="badge badge-primary" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                          {product.category}
                        </span>

                        {/* Floating Quick Action Badges (Wishlist & Compare) */}
                        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {currentUser?.role === 'customer' && (
                            <button
                              onClick={(e) => handleSaveProduct(e, product)}
                              title={saved ? 'Remove from saved items' : 'Save for later'}
                              aria-label={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.92)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)',
                                color: saved ? 'var(--danger)' : 'var(--text-main)',
                                transition: 'transform 0.2s'
                              }}
                            >
                              <Heart size={15} fill={saved ? 'var(--danger)' : 'none'} />
                            </button>
                          )}

                          <button
                            onClick={(e) => toggleCompare(e, product)}
                            title={isCompared ? 'Remove from comparison' : 'Compare produce'}
                            style={{
                              height: '30px',
                              backgroundColor: isCompared ? 'var(--primary)' : 'rgba(255,255,255,0.92)',
                              color: isCompared ? '#ffffff' : 'var(--text-main)',
                              border: 'none',
                              borderRadius: '15px',
                              padding: '0 8px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              cursor: 'pointer',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <Scale size={12} />
                            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                          </button>
                        </div>

                        {product.quantity === 0 && (
                          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 700 }}>
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Farmer Line */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            By <strong style={{ color: 'var(--text-main)' }}>{product.farmerName}</strong>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatFarmer({ name: product.farmerName, product: product.name });
                            }}
                            title={`Chat with ${product.farmerName}`}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: 0
                            }}
                          >
                            <MessageSquare size={13} />
                            <span>Ask</span>
                          </button>
                        </div>

                        {/* Title with uniform 2-line clamping */}
                        <h3 
                          style={{ 
                            fontSize: '1.05rem', 
                            fontWeight: 700, 
                            margin: '0.2rem 0 0.5rem',
                            lineHeight: 1.35,
                            height: '2.8rem',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }} 
                          title={product.name}
                        >
                          {product.name}
                        </h3>

                        {/* Unit & Stock Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', padding: '0.35rem 0.6rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                          <span>Unit: <strong style={{ color: 'var(--text-main)' }}>{product.unit}</strong></span>
                          <span>Stock: <strong style={{ color: product.quantity > 5 ? 'var(--success)' : 'var(--danger)' }}>{product.quantity}</strong></span>
                        </div>

                        {/* Price & Quick Negotiation/Alert row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', marginBottom: '0.75rem', paddingTop: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(product.price)}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '3px' }}>/ {product.unit}</span>
                          </div>

                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button 
                              className="btn btn-outline btn-sm"
                              title="Set Price Drop Alert"
                              style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                              onClick={() => setPriceAlertProduct(product)}
                            >
                              <Bell size={14} />
                            </button>
                            <button 
                              className="btn btn-outline btn-sm"
                              title="Propose Fair Offer / Negotiate"
                              style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px' }}
                              onClick={() => setNegotiateProduct(product)}
                            >
                              <Scale size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Primary Actions Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-200)' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.82rem' }}
                            onClick={() => openDetailModal(product)}
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>

                          {canShop ? (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.82rem' }}
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={product.quantity === 0}
                            >
                              <ShoppingCart size={14} />
                              <span>{product.quantity === 0 ? 'Out' : 'Add'}</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ width: '100%', padding: '0.45rem 0.5rem', fontSize: '0.82rem' }}
                              onClick={() => openDetailModal(product)}
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Compare Matrix Bar */}
      {compareItems.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--card-bg)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 20px',
            boxShadow: 'var(--shadow-hover)',
            border: '2px solid var(--primary)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideUp 0.25s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Scale size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
              {compareItems.length} {compareItems.length === 1 ? 'item' : 'items'} in comparison
            </span>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCompareModal(true)}
            style={{ borderRadius: 'var(--radius-full)', padding: '6px 16px' }}
          >
            View Matrix
          </button>

          <button
            onClick={() => setCompareItems([])}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showCompareModal && (
        <ProductCompareModal
          products={compareItems}
          onClose={() => setShowCompareModal(false)}
          onAddToCart={(product) => handleAddToCart(null, product)}
          canShop={canShop}
        />
      )}

      {/* Farmer Direct Chat Modal */}
      {chatFarmer && (
        <FarmerChatModal
          farmerName={chatFarmer.name}
          productName={chatFarmer.product}
          onClose={() => setChatFarmer(null)}
        />
      )}

      {/* Dynamic Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={closeDetailModal}
        >
          <div 
            className="card modal-content"
            style={{
              width: '100%',
              maxWidth: '750px',
              backgroundColor: 'var(--white)',
              margin: 'auto',
              display: 'grid',
              gridTemplateColumns: '1.1fr 1fr',
              overflow: 'hidden',
              maxHeight: '90vh',
              animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image banner */}
            <div style={{ position: 'relative', height: '100%', minHeight: '320px' }}>
              <img 
                src={selectedProduct.imageUrl} 
                alt={selectedProduct.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }}
              />
              <span className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                {selectedProduct.category}
              </span>
            </div>

            {/* Info panel */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Grower: {selectedProduct.farmerName}</span>
                <button
                  onClick={() => {
                    closeDetailModal();
                    setChatFarmer({ name: selectedProduct.farmerName, product: selectedProduct.name });
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                >
                  <MessageSquare size={13} /> Chat Grower
                </button>
              </div>

              <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1rem' }}>{selectedProduct.name}</h2>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(selectedProduct.price)}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ {selectedProduct.unit}</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {selectedProduct.description}
              </p>

              {/* Traceability Link Banner */}
              <Link
                to="/traceability"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--primary-bg)',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '8px',
                  color: 'var(--primary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem'
                }}
              >
                <ShieldCheck size={16} />
                <span>View Full Batch QR & Soil Lab Certificate</span>
              </Link>

              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  <span>Stock availability:</span>
                  <span style={{ fontWeight: 'bold' }}>{selectedProduct.quantity} {selectedProduct.unit}s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Product code:</span>
                  <span style={{ fontFamily: 'monospace' }}>{selectedProduct.id}</span>
                </div>
              </div>

              {selectedProduct.quantity > 0 && canShop ? (
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-300)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                      >
                        -
                      </button>
                      <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{detailQty}</span>
                      <button 
                        style={{ padding: '0.4rem 0.8rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                        onClick={() => setDetailQty(Math.min(selectedProduct.quantity, detailQty + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleModalAddCart}>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </button>
                    <button className="btn btn-outline" onClick={closeDetailModal}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : selectedProduct.quantity === 0 ? (
                <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }} disabled>
                  Out of Stock
                </button>
              ) : (
                <button className="btn btn-outline" style={{ width: '100%', marginTop: 'auto' }} onClick={closeDetailModal}>
                  Back to marketplace
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Negotiation Modal */}
      {negotiateProduct && (
        <NegotiationModal
          product={negotiateProduct}
          onClose={() => setNegotiateProduct(null)}
          onSuccess={() => showToast('Offer sent to grower!', 'success')}
        />
      )}

      {/* Price Alert Modal */}
      {priceAlertProduct && (
        <PriceAlertModal
          productName={priceAlertProduct.name}
          currentPrice={priceAlertProduct.price}
          unit={priceAlertProduct.unit || 'kg'}
          onClose={() => setPriceAlertProduct(null)}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .marketplace-grid {
            grid-template-columns: 1fr !important;
          }
          .modal-content {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
