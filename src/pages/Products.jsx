import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, ShoppingCart, Heart, Eye, HelpCircle } from 'lucide-react';
import { getProducts } from '../services/firebaseDb';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../utils/currency';

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

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (currentUser && currentUser.role !== 'customer') {
      showToast('Only customer accounts can place orders.', 'warning');
      return;
    }
    // Auto-login to Customer for visual comfort if not logged in
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
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Direct Farmer Marketplace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Fresh organic harvest sourced straight from verified regional gardens</p>
        </div>

        {/* Search, Filter & Sort Controls layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }} className="marketplace-grid">
          
          {/* Sidebar Filters */}
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <SlidersHorizontal size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem' }}>Filter Marketplace</h3>
            </div>

            {/* Keyword Search */}
            <div className="form-group">
              <label className="form-label" htmlFor="search">Search Products</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  id="search" 
                  className="form-input" 
                  placeholder="e.g. Tomato, John..."
                  style={{ paddingLeft: '2.4rem', fontSize: '0.9rem' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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
            <div className="form-group">
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
                marginBottom: '2rem',
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', margin: '-0.75rem 0 1.5rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </span>
              {(search || category !== 'All' || maxPrice !== 10 || sortBy !== 'newest') && (
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
                {filteredProducts.map((product) => (
                  <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <span className="badge badge-primary" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                        {product.category}
                      </span>
                      {product.quantity === 0 && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)', fontWeight: 'bold' }}>
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By {product.farmerName}</span>
                      <h3 style={{ fontSize: '1.15rem', margin: '0.4rem 0' }}>{product.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                        <span>Unit: <strong>{product.unit}</strong></span>
                        <span>Stock: <strong>{product.quantity}</strong></span>
                      </div>
                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(product.price)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            className="btn btn-outline btn-sm"
                            title="View Details"
                            style={{ padding: '0.5rem' }}
                            onClick={() => openDetailModal(product)}
                          >
                            <Eye size={16} />
                          </button>
                          {currentUser?.role === 'customer' && (
                            <button
                              className="btn btn-outline btn-sm"
                              title={isSaved(product.id) ? 'Remove from saved items' : 'Save for later'}
                              aria-label={isSaved(product.id) ? `Remove ${product.name} from saved items` : `Save ${product.name} for later`}
                              style={{ padding: '0.5rem' }}
                              onClick={(e) => handleSaveProduct(e, product)}
                            >
                              <Heart size={16} fill={isSaved(product.id) ? 'var(--danger)' : 'none'} color={isSaved(product.id) ? 'var(--danger)' : 'currentColor'} />
                            </button>
                          )}
                          {canShop && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ padding: '0.5rem 0.8rem' }}
                              onClick={(e) => handleAddToCart(e, product)}
                              disabled={product.quantity === 0}
                            >
                              <ShoppingCart size={16} />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Grower: {selectedProduct.farmerName}</span>
              <h2 style={{ fontSize: '1.8rem', margin: '0.5rem 0 1rem' }}>{selectedProduct.name}</h2>
              
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(selectedProduct.price)}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ {selectedProduct.unit}</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                {selectedProduct.description}
              </p>

              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
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
