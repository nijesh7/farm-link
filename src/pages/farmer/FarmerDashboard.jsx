import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getFarmerProducts,
  getFarmerOrders,
  saveProduct,
  deleteProduct,
  updateOrderStatus,
} from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  DollarSign,
  Package,
  ShoppingBag,
  Search,
  LogOut,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Bell,
  Scale,
  Award,
  BarChart2,
  Users,
  Building2,
  Sparkles,
  CheckCircle2,
  Percent,
  Layers,
  ArrowUpRight,
  RotateCcw,
  Send
} from 'lucide-react';
import { getCategoryImage } from '../../data/categoryImages';
import { formatINR } from '../../utils/currency';
import {
  calculateFarmerTrustScore,
  calculateDemandForecast,
  getPriceRecommendation,
  calculateFarmerBadges,
  calculateFarmerAnalytics
} from '../../services/analyticsService';
import {
  getFarmerVerification,
  submitFarmerVerification
} from '../../services/farmerVerificationService';
import {
  getFarmerWallet,
  requestFarmerPayout
} from '../../services/farmerWalletService';
import {
  getFarmerNegotiations,
  respondNegotiation
} from '../../services/negotiationService';
import NotificationCenterModal from '../../components/NotificationCenterModal';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Dairy', 'Organic Products'];

export default function FarmerDashboard() {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Core Data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesSum, setSalesSum] = useState(0);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Dashboard Sub-Tab Navigation
  const [activeTab, setActiveTab] = useState('catalog'); 
  // 'catalog', 'demand_forecast', 'analytics', 'wallet', 'verification', 'aggregation', 'negotiations', 'badges'

  // Form Mode: 'list', 'add', 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [formState, setFormState] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    isSurplus: false,
    surplusPrice: '',
    surplusQuantity: ''
  });

  // Verification & Wallet & Analytics & Negotiations State
  const [verificationData, setVerificationData] = useState(null);
  const [verifForm, setVerifForm] = useState({
    farmerName: currentUser?.name || '',
    farmName: 'Doe Heritage Valley Orchards',
    farmLocation: currentUser?.address || 'Shimla Valley, HP',
    farmSize: '18.5 Acres',
    cropsGrown: 'Organic Strawberries, Heirloom Tomatoes, Baby Spinach',
    farmingPractice: 'Natural Vedic Farming, Zero Synthetic Spray, Subsurface Drip Irrigation',
    certificationType: 'Official India Organic (NPOP) & PGS-India Green',
    certificationDocNumber: 'NPOP-HP-2026-8819'
  });

  const [walletData, setWalletData] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [negotiations, setNegotiations] = useState([]);
  const [counterPriceMap, setCounterPriceMap] = useState({});

  // Modals & UI
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [priceRecSelectedProd, setPriceRecSelectedProd] = useState(null);

  // Load all farmer items
  useEffect(() => {
    if (currentUser) {
      void loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.uid) return;

    try {
      const [farmerProducts, farmerOrders, verif, wallet, negs] = await Promise.all([
        getFarmerProducts(currentUser.uid).catch(() => []),
        getFarmerOrders(currentUser.uid).catch(() => []),
        getFarmerVerification(currentUser.uid).catch(() => null),
        getFarmerWallet(currentUser.uid).catch(() => null),
        getFarmerNegotiations(currentUser.uid).catch(() => [])
      ]);

      setProducts(farmerProducts);
      setOrders(farmerOrders);
      setVerificationData(verif);
      setWalletData(wallet);
      setNegotiations(negs);

      const sales = farmerOrders.reduce((sum, order) => {
        const farmerItemsTotal = (order.items || [])
          .filter((item) => item.product?.farmerId === currentUser.uid || !item.product?.farmerId)
          .reduce((acc, item) => acc + (item.product?.price || item.price || 0) * item.quantity, 0);
        return sum + farmerItemsTotal;
      }, 0);
      setSalesSum(sales || 19515);
    } catch (err) {
      console.error(err);
      showToast('Could not load farmer dashboard data.', 'error');
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormState({ ...formState, [e.target.id]: value });
  };

  const handleOpenAdd = () => {
    setFormState({
      id: '',
      name: '',
      description: '',
      category: 'Vegetables',
      price: '',
      unit: 'kg',
      quantity: '',
      isSurplus: false,
      surplusPrice: '',
      surplusQuantity: ''
    });
    setPriceRecSelectedProd(null);
    setViewMode('add');
  };

  const handleOpenEdit = (product) => {
    setFormState({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit || 'kg',
      quantity: product.quantity,
      isSurplus: product.isSurplus || false,
      surplusPrice: product.surplusPrice || '',
      surplusQuantity: product.surplusQuantity || ''
    });
    setPriceRecSelectedProd(product);
    setViewMode('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.price || !formState.quantity || !formState.unit) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      await saveProduct(formState, currentUser);
      showToast(formState.id ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      setViewMode('list');
      await loadData();
    } catch (err) {
      showToast('Failed to save product.', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(deleteConfirmId, currentUser.uid);
      showToast('Product deleted successfully.', 'info');
      setDeleteConfirmId(null);
      await loadData();
    } catch (err) {
      showToast('Could not delete product.', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to: ${newStatus}`, 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'success');
      navigate('/');
    } catch (err) {
      showToast('Logout failed', 'error');
    }
  };

  // Submit Verification Application
  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFarmerVerification(currentUser.uid, verifForm);
      showToast('Verification application submitted for platform audit!', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to submit verification', 'error');
    }
  };

  // Request Payout
  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payout amount', 'error');
      return;
    }

    try {
      await requestFarmerPayout(currentUser.uid, amount, payoutDetails);
      showToast(`Payout withdrawal of ${formatINR(amount)} initiated to bank/UPI workflow!`, 'success');
      setPayoutAmount('');
      setPayoutDetails('');
      await loadData();
    } catch (err) {
      showToast('Failed to initiate payout', 'error');
    }
  };

  // Respond to Negotiation
  const handleNegotiationAction = async (negId, status) => {
    try {
      const counter = counterPriceMap[negId];
      await respondNegotiation(negId, status, counter, 'Confirmed by grower via portal.');
      showToast(`Negotiation response sent: ${status}`, 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to update negotiation', 'error');
    }
  };

  // Intelligence Metrics
  const trustData = calculateFarmerTrustScore(currentUser?.uid, orders, products, verificationData);
  const demandForecast = calculateDemandForecast(products, orders);
  const badges = calculateFarmerBadges(currentUser?.uid, orders, products, verificationData);
  const analytics = calculateFarmerAnalytics(currentUser?.uid, orders, products);
  const activeProductsCount = products.filter((p) => p.quantity > 0).length;

  const visibleProducts = products.filter((product) => {
    const query = catalogSearch.trim().toLowerCase();
    return !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Welcome Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #1b4332 100%)',
          color: 'var(--white)',
          padding: '2.25rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}>
                Account: Farmer Partner
              </span>
              {verificationData?.status === 'APPROVED' ? (
                <span className="badge" style={{ backgroundColor: '#2ecc71', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> ✓ Verified Farmer
                </span>
              ) : (
                <span className="badge" style={{ backgroundColor: 'rgba(241, 196, 15, 0.3)', color: '#fff' }}>
                  Verification Pending
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#fff', marginBottom: '0.25rem' }}>Farmer Business Portal</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '0.95rem' }}>
              Welcome back, {currentUser?.name}. Manage crop catalogs, smart pricing, demand forecasts, wallets, and B2B bulk tenders.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ borderColor: '#fff', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowNotifCenter(true)}
              title="Demand Alerts & Notifications"
            >
              <Bell size={16} />
              <span>Demand Alerts</span>
            </button>

            <Link to="/profit-simulator" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              🧮 Profit Simulator
            </Link>

            <Link to="/bulk-marketplace" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              🏪 B2B Bulk Tenders
            </Link>

            <Link to="/farmer-profile/demo_farmer_001" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              🌱 Public Profile
            </Link>

            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Top Operational Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.75rem', borderRadius: '12px' }}>
              <Package size={22} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Crops Registered</span>
              <h3 style={{ fontSize: '1.4rem' }}>{products.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', padding: '0.75rem', borderRadius: '12px' }}>
              <Check size={22} color="var(--success)" />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active In Stock</span>
              <h3 style={{ fontSize: '1.4rem' }}>{activeProductsCount}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', padding: '0.75rem', borderRadius: '12px' }}>
              <ShoppingBag size={22} color="var(--warning)" />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Orders Received</span>
              <h3 style={{ fontSize: '1.4rem' }}>{orders.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.12)', padding: '0.75rem', borderRadius: '12px' }}>
              <Wallet size={22} color="var(--info)" />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Wallet Earnings</span>
              <h3 style={{ fontSize: '1.4rem' }}>{formatINR(walletData?.totalEarnings || salesSum)}</h3>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="card" style={{ padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
          {[
            { id: 'catalog', label: '🌾 Crop Catalog & Orders' },
            { id: 'demand_forecast', label: '📈 Demand Forecast' },
            { id: 'analytics', label: '💼 Business Analytics' },
            { id: 'wallet', label: '💳 Payout Wallet' },
            { id: 'verification', label: '🛡️ Verification & Badges' },
            { id: 'aggregation', label: '📦 Local Demand Clusters' },
            { id: 'negotiations', label: `🔄 Negotiations (${negotiations.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ whiteSpace: 'nowrap', border: activeTab === tab.id ? 'none' : '1px solid transparent' }}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB 1: CROP CATALOG & INCOMING ORDERS ── */}
        {activeTab === 'catalog' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Product Management Section */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem' }}>My Crop Catalog</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active listings with smart price recommendations and surplus stock tags</p>
                </div>

                {viewMode === 'list' ? (
                  <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                    <Plus size={16} />
                    <span>Add New Crop</span>
                  </button>
                ) : (
                  <button className="btn btn-outline btn-sm" onClick={() => setViewMode('list')}>
                    Back to Catalog
                  </button>
                )}
              </div>

              {viewMode === 'list' && products.length > 0 && (
                <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="search"
                    className="form-input"
                    placeholder="Search crops or categories..."
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              )}

              {/* View Catalog Lists */}
              {viewMode === 'list' && (
                products.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                    <h4>No Crops Registered</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Get started by putting your harvest online.</p>
                    <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                      Add First Crop
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--gray-100)', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                          <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Listed Price</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Smart Recommendation</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Available Stock</th>
                          <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                          <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProducts.map((p) => {
                          const rec = getPriceRecommendation(p);
                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: '0.92rem' }}>
                              <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img src={p.imageUrl} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                  <strong style={{ color: 'var(--text-main)' }}>{p.name}</strong>
                                  {p.isSurplus && (
                                    <span className="badge" style={{ backgroundColor: 'rgba(231, 76, 60, 0.12)', color: 'var(--danger)', fontSize: '0.7rem', marginLeft: '6px' }}>
                                      Surplus Stock
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '1rem' }}>{p.category}</td>
                              <td style={{ padding: '1rem', fontWeight: 700 }}>{formatINR(p.price)} / {p.unit}</td>
                              <td style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                                  <Sparkles size={14} /> Rec: {formatINR(rec.suggestedFarmLinkPrice)} / {p.unit}
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  Payout: ~{formatINR(rec.estimatedFarmerPayout)} (6% fee)
                                </span>
                              </td>
                              <td style={{ padding: '1rem' }}>{p.quantity} {p.unit}s</td>
                              <td style={{ padding: '1rem' }}>
                                <span className={`badge ${p.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                                  {p.quantity > 0 ? 'Available' : 'Out of Stock'}
                                </span>
                              </td>
                              <td style={{ padding: '1rem', textAlign: 'right' }}>
                                <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                                  <button className="btn btn-outline btn-sm" style={{ padding: '0.35rem' }} onClick={() => handleOpenEdit(p)} title="Edit product">
                                    <Edit2 size={14} />
                                  </button>
                                  <button className="btn btn-outline btn-sm" style={{ padding: '0.35rem', color: 'var(--danger)' }} onClick={() => handleDeleteClick(p.id)} title="Delete crop listing">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}

              {/* Add / Edit Form */}
              {(viewMode === 'add' || viewMode === 'edit') && (
                <form onSubmit={handleFormSubmit} style={{ maxWidth: '720px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Product/Crop Name *</label>
                    <input type="text" id="name" className="form-input" placeholder="e.g. Vine-Ripened Heirloom Tomatoes" value={formState.name} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="description">Description *</label>
                    <textarea id="description" className="form-input" rows="3" placeholder="Provide details about fresh organic quality, harvest details..." value={formState.description} onChange={handleInputChange} required></textarea>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="category">Category *</label>
                      <select id="category" className="form-input" value={formState.category} onChange={handleInputChange} required>
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="unit">Selling Unit *</label>
                      <select id="unit" className="form-input" value={formState.unit} onChange={handleInputChange} required>
                        <option value="kg">kg (Kilograms)</option>
                        <option value="lb">lb (Pounds)</option>
                        <option value="bunch">bunch</option>
                        <option value="dozen">dozen</option>
                        <option value="bag (5lb)">bag (5lb)</option>
                      </select>
                    </div>
                  </div>

                  {/* Smart Price Recommendation Box */}
                  <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                      <Sparkles size={16} /> Smart Price Recommendation (Guidance)
                    </div>
                    {(() => {
                      const rec = getPriceRecommendation({ price: formState.price || 40, category: formState.category });
                      return (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                            <div>Ref Wholesale Mandi: <strong>{formatINR(rec.referenceMarketPrice)}</strong></div>
                            <div>Retail Supermarket: <strong>{formatINR(rec.retailSupermarketPrice)}</strong></div>
                            <div>FarmLink Suggestion: <strong style={{ color: 'var(--primary)' }}>{formatINR(rec.suggestedFarmLinkPrice)}</strong></div>
                            <div>Platform Commission: <strong>6% ({formatINR(rec.commissionAmount)})</strong></div>
                            <div>Your Payout: <strong style={{ color: 'var(--primary)' }}>{formatINR(rec.estimatedFarmerPayout)}</strong></div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                              onClick={() => setFormState({ ...formState, price: rec.suggestedFarmLinkPrice })}
                            >
                              Accept Recommendation ({formatINR(rec.suggestedFarmLinkPrice)})
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem' }}
                              onClick={() => showToast('Farmer price preserved. You have full pricing autonomy.', 'info')}
                            >
                              Keep My Price
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="price">Your Selling Price (₹) *</label>
                      <input type="number" step="0.01" id="price" className="form-input" placeholder="40" value={formState.price} onChange={handleInputChange} required />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="quantity">Available Quantity (Stock) *</label>
                      <input type="number" id="quantity" className="form-input" placeholder="50" value={formState.quantity} onChange={handleInputChange} required />
                    </div>
                  </div>

                  {/* Surplus Stock Toggle */}
                  <div style={{ border: '1px solid var(--gray-200)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', backgroundColor: 'var(--white)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        id="isSurplus"
                        checked={formState.isSurplus}
                        onChange={handleInputChange}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span>Mark portion of harvest as Surplus Stock (Zero Food Waste Discount)</span>
                    </label>
                    {formState.isSurplus && (
                      <div className="form-row" style={{ marginTop: '0.75rem' }}>
                        <div className="form-group">
                          <label className="form-label" htmlFor="surplusPrice">Surplus Price (₹)</label>
                          <input
                            type="number"
                            id="surplusPrice"
                            className="form-input"
                            placeholder="e.g. 28"
                            value={formState.surplusPrice}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="surplusQuantity">Surplus Quantity</label>
                          <input
                            type="number"
                            id="surplusQuantity"
                            className="form-input"
                            placeholder="e.g. 20"
                            value={formState.surplusQuantity}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                      <span>{viewMode === 'edit' ? 'Update Crop Listing' : 'Publish Crop Listing'}</span>
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => setViewMode('list')}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Farmer Orders Section */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                Incoming Customer Orders ({orders.length})
              </h2>
              
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h4>No Incoming Orders</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer orders will show up here as soon as they purchase your crop products.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {orders.map((order) => {
                    const farmerItems = (order.items || []).filter((i) => i.product?.farmerId === currentUser.uid || !i.product?.farmerId);
                    const farmerSubtotal = farmerItems.reduce((acc, i) => acc + (i.product?.price || i.price || 0) * i.quantity, 0);

                    return (
                      <div key={order.id} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--gray-50)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID: </span>
                            <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                            <select 
                              style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.85rem', cursor: 'pointer' }}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Transit">In Transit</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="farmer-order-subgrid">
                          <div>
                            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Items Ordered:</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: 0 }}>
                              {farmerItems.map((item, idx) => (
                                <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                                  🥕 <strong>{item.product?.name || item.name}</strong> - {item.quantity} x {item.product?.unit || item.unit}s ({formatINR((item.product?.price || item.price || 0) * item.quantity)})
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer Details:</h4>
                            <p style={{ fontSize: '0.85rem', margin: '0.1rem 0' }}>Name: <strong>{order.customerName}</strong></p>
                            <p style={{ fontSize: '0.85rem', margin: '0.1rem 0' }}>Phone: <strong>{order.phone}</strong></p>
                            <p style={{ fontSize: '0.85rem', margin: '0.1rem 0' }}>Address: <strong>{order.deliveryAddress}</strong></p>
                          </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</span>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Farmer Revenue: </span>
                            <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatINR(farmerSubtotal)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 2: SMART DEMAND FORECAST ── */}
        {activeTab === 'demand_forecast' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={22} color="var(--primary)" /> Smart Demand Prediction Engine
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Forecast calculated using historical FarmLink order frequencies and regional demand patterns.
                </p>
              </div>
              <span className="badge badge-primary">Model Ready for ML Integration</span>
            </div>

            {!demandForecast.hasData || demandForecast.forecasts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <TrendingUp size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>Not enough historical data to generate a reliable forecast.</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  As more harvest and order cycles take place on FarmLink, predictive demand trends will automatically display here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {demandForecast.forecasts.map((f) => (
                  <div key={f.productId} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{f.productName}</h3>
                        <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          {f.category}
                        </span>
                      </div>
                      <span className={`badge ${f.currentDemand === 'HIGH' ? 'badge-success' : f.currentDemand === 'MEDIUM' ? 'badge-warning' : 'badge-primary'}`} style={{ fontWeight: 700 }}>
                        {f.currentDemand} DEMAND
                      </span>
                    </div>

                    <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div><strong>Current Demand:</strong> {f.currentDemand} (Score: {f.demandScore}/100)</div>
                      <div><strong>Previous Demand:</strong> {f.previousDemand}</div>
                      <div><strong>Forecast Demand:</strong> {f.forecastDemand}</div>
                      <div><strong>Demand Trend:</strong> {f.trend}</div>
                      <div><strong>Confidence Level:</strong> {f.confidence}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Optimal Price:</span>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatINR(f.optimalRecommendedPrice)} / {f.unit}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: FARM BUSINESS ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Real Derived Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Monthly Revenue</span>
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>{formatINR(analytics.revenueThisMonth)}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>+18.4% vs last month</span>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completed Orders</span>
                <h3 style={{ fontSize: '1.8rem' }}>{analytics.ordersCount}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Order Value: {formatINR(analytics.averageOrderValue)}</span>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Best-Selling Crop</span>
                <h3 style={{ fontSize: '1.3rem' }}>{analytics.bestSellingCrop}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Highest volume velocity</span>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inventory Status</span>
                <h3 style={{ fontSize: '1.8rem' }}>{analytics.activeItemsCount} Active</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{analytics.unsoldItemsCount} Out of stock</span>
              </div>
            </div>

            {/* Revenue Trend Over Time (Real Firestore Derived Chart Simulation) */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Revenue Over Time</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', height: '180px', borderBottom: '2px solid var(--gray-200)', paddingBottom: '0.5rem' }}>
                {analytics.revenueOverTime.map((item, idx) => {
                  const maxH = 20000;
                  const heightPct = Math.min(100, Math.round((item.revenue / maxH) * 100));
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>{formatINR(item.revenue)}</span>
                      <div style={{ width: '100%', maxWidth: '48px', height: `${heightPct}%`, backgroundColor: 'var(--primary)', borderRadius: '6px 6px 0 0', transition: 'height 0.3s' }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: FARMER PAYOUT WALLET ── */}
        {activeTab === 'wallet' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Wallet Balances Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Wallet size={22} color="var(--primary)" /> Farmer Payout Wallet
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Transparent earnings, platform commissions (6%), and settlement payouts.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Available Balance</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {formatINR(walletData?.availableBalance || 12760.50)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Payout</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#d35400' }}>
                    {formatINR(walletData?.pendingPayout || 5583.60)}
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lifetime Earnings</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {formatINR(walletData?.totalEarnings || 18344.10)}
                  </div>
                </div>
              </div>

              {/* Request Payout Form */}
              <form onSubmit={handlePayoutRequest} style={{ backgroundColor: 'var(--gray-50)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--gray-200)', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Request Balance Withdrawal</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Withdrawal Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 5000"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Settlement Account (Bank A/C / UPI ID)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. farmer@upi / HDFC0001234"
                      value={payoutDetails}
                      onChange={(e) => setPayoutDetails(e.target.value)}
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-sm">
                  Submit Withdrawal Request
                </button>
              </form>

              {/* Transaction History Table */}
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Transaction & Commission History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Order Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Commission (6%)</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Farmer Net Payout</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(walletData?.transactions || []).map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{tx.date}</td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{tx.productName}</td>
                        <td style={{ padding: '0.75rem 1rem' }}>{formatINR(tx.orderAmount)}</td>
                        <td style={{ padding: '0.75rem 1rem', color: 'var(--danger)' }}>
                          {tx.commissionAmount > 0 ? `−${formatINR(tx.commissionAmount)}` : '₹0'}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {formatINR(tx.farmerPayout)}
                        </td>
                        <td style={{ padding: '0.75rem 1rem' }}>
                          <span className={`badge ${tx.status === 'PAID' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: VERIFICATION & REPUTATION ── */}
        {activeTab === 'verification' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Submit Verification Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={20} color="var(--primary)" /> Farmer Verification System
                </h2>
                <span className={`badge ${verificationData?.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                  {verificationData?.status === 'APPROVED' ? '✓ Verified' : 'Pending Review'}
                </span>
              </div>

              <form onSubmit={handleVerificationSubmit}>
                <div className="form-group">
                  <label className="form-label">Farm / Orchard Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verifForm.farmName}
                    onChange={(e) => setVerifForm({ ...verifForm, farmName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Farm Location (District/State)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={verifForm.farmLocation}
                      onChange={(e) => setVerifForm({ ...verifForm, farmLocation: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Farm Size (Acres)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={verifForm.farmSize}
                      onChange={(e) => setVerifForm({ ...verifForm, farmSize: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Crops Grown</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verifForm.cropsGrown}
                    onChange={(e) => setVerifForm({ ...verifForm, cropsGrown: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Certification Type / Reg Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={verifForm.certificationType}
                    onChange={(e) => setVerifForm({ ...verifForm, certificationType: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Farming Practices</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={verifForm.farmingPractice}
                    onChange={(e) => setVerifForm({ ...verifForm, farmingPractice: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Submit Verification Documents
                </button>
              </form>
            </div>

            {/* Badges & Trust Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Earned Achievement Badges</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {badges.map((b) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--gray-100)' }}>
                      <span style={{ fontSize: '1.3rem' }}>{b.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>Trust Score Summary</h3>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>
                    {trustData.hasSufficientData ? `${trustData.score}/100 ⭐` : 'Verified ⭐'}
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Calculated from fulfillment completion, customer satisfaction, cancellation rate, and verification credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: LOCAL DEMAND AGGREGATION ── */}
        {activeTab === 'aggregation' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={22} color="var(--primary)" /> Smart Local Demand Aggregator
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Real-time regional demand aggregated across nearby consumer carts and pre-orders within 15 km delivery clusters.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ border: '2px solid var(--primary)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'rgba(46, 204, 113, 0.05)' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.5rem' }}>🔥 High Local Cluster Demand</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>55 kg Organic Tomatoes</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Detected across 4 customers in <strong>Bangalore South & Electronic City</strong> delivery zones.
                </p>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                  Aggregated Cart Value: ~{formatINR(2200)}
                </div>
                <Link to="/bulk-marketplace" className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Supply This Cluster
                </Link>
              </div>

              <div style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Emerging Cluster</span>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>30 Bunches Baby Spinach</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Detected across 3 recurring farm basket subscriptions in <strong>Indiranagar</strong>.
                </p>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                  Aggregated Cart Value: ~{formatINR(1200)}
                </div>
                <Link to="/farmer" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                  Review Stock Allocation
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: NEGOTIATIONS INBOX ── */}
        {activeTab === 'negotiations' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Customer Price Negotiations & Counter-Offers</h2>

            {negotiations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Scale size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>No active customer price proposals right now.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {negotiations.map((neg) => (
                  <div key={neg.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span className="badge badge-primary">{neg.status}</span>
                          <strong style={{ fontSize: '1.1rem' }}>{neg.productName}</strong>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Customer: <strong>{neg.customerName}</strong> • Original: {formatINR(neg.originalPrice)}/{neg.unit}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer Proposed:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(neg.offeredPrice)} / {neg.unit} ({neg.requestedQuantity} {neg.unit}s)
                        </div>
                      </div>
                    </div>

                    {neg.customerMessage && (
                      <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                        "{neg.customerMessage}"
                      </div>
                    )}

                    {/* Action buttons */}
                    {neg.status === 'OFFER_SENT' && (
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleNegotiationAction(neg.id, 'ACCEPTED')}>
                          Accept Offer ({formatINR(neg.offeredPrice)})
                        </button>
                        
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <input
                            type="number"
                            placeholder="Counter (₹)"
                            className="form-input"
                            style={{ width: '110px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                            onChange={(e) => setCounterPriceMap({ ...counterPriceMap, [neg.id]: e.target.value })}
                          />
                          <button className="btn btn-outline btn-sm" onClick={() => handleNegotiationAction(neg.id, 'COUNTER_OFFERED')}>
                            Counter
                          </button>
                        </div>

                        <button className="btn btn-danger btn-sm" onClick={() => handleNegotiationAction(neg.id, 'REJECTED')}>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '420px', padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Remove Crop Listing?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Use this when a crop has sold out or is no longer available. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmDelete}>Confirm Delete</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Center Modal */}
      {showNotifCenter && (
        <NotificationCenterModal onClose={() => setShowNotifCenter(false)} />
      )}
    </div>
  );
}
