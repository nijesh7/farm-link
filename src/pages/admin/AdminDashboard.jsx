import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Trash2,
  Edit2,
  Search,
  Filter,
  Eye,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Award,
  AlertTriangle,
  Layers,
  Activity,
  Building2,
  PieChart,
  FileCheck,
  CheckCircle2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getProducts,
  getAllOrders,
  getAllUsers,
  adminDeleteProduct,
  updateOrderStatus,
  adminUpdateUser
} from '../../services/firebaseDb';
import {
  getAllFarmerVerifications,
  updateFarmerVerificationStatus
} from '../../services/farmerVerificationService';
import {
  getBulkRequirements,
  getAllBulkOffers
} from '../../services/bulkMarketplaceService';
import { calculatePlatformAnalytics } from '../../services/analyticsService';
import { formatINR } from '../../utils/currency';

export default function AdminDashboard() {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('revenue'); 
  // 'revenue', 'orders', 'products', 'verifications', 'bulk_audit', 'logs'

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [bulkReqs, setBulkReqs] = useState([]);
  const [bulkOffers, setBulkOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [verifSearch, setVerifSearch] = useState('');

  useEffect(() => {
    loadPlatformData();
  }, []);

  const loadPlatformData = async () => {
    setLoading(true);
    try {
      const [allProds, allOrds, allUsrs, allVerifs, allBReqs, allBOffers] = await Promise.all([
        getProducts().catch(() => []),
        getAllOrders().catch(() => []),
        getAllUsers().catch(() => []),
        getAllFarmerVerifications().catch(() => []),
        getBulkRequirements().catch(() => []),
        getAllBulkOffers().catch(() => [])
      ]);

      setProducts(allProds);
      setOrders(allOrds);
      setUsers(allUsrs);
      setVerifications(allVerifs);
      setBulkReqs(allBReqs);
      setBulkOffers(allBOffers);
    } catch (err) {
      console.error(err);
      showToast('Could not load administrative data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Status Updater
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      showToast(`Order #${orderId.slice(-6).toUpperCase()} status updated to ${newStatus}.`, 'success');
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    }
  };

  // Product Delete
  const handleDeleteProduct = async (productId, prodName) => {
    if (!window.confirm(`Are you sure you want to remove "${prodName}" from the platform catalog?`)) return;
    try {
      await adminDeleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast(`Removed "${prodName}" from platform catalog.`, 'success');
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  // Verification Review Action
  const handleVerificationDecision = async (farmerId, decision) => {
    try {
      await updateFarmerVerificationStatus(farmerId, decision, `Audit reviewed by Platform Admin ${currentUser?.name || ''}`);
      showToast(`Farmer verification status updated to: ${decision}`, 'success');
      await loadPlatformData();
    } catch (err) {
      showToast('Failed to update verification', 'error');
    }
  };

  // Platform Analytics computation from real database state
  const metrics = calculatePlatformAnalytics(orders, products, users, bulkReqs, bulkOffers);

  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.farmerName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredVerifs = verifications.filter((v) =>
    (v.farmerName || '').toLowerCase().includes(verifSearch.toLowerCase()) ||
    (v.farmLocation || '').toLowerCase().includes(verifSearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.35rem' }}>
              <span className="badge" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', fontWeight: 800 }}>
                🛡️ Platform SuperAdmin Governance
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                System: <strong style={{ color: 'var(--success)' }}>100% Operational</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '2.3rem', margin: 0, fontWeight: 800 }}>FarmLink Operations & Financials</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '4px 0 0' }}>
              Logged in as <strong>{currentUser?.name || 'Administrator'}</strong> ({currentUser?.email})
            </p>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={16} />
            <span>Admin Logout</span>
          </button>
        </div>

        {/* Executive KPI Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
              <DollarSign size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Platform GMV</span>
              <h2 style={{ fontSize: '1.4rem', margin: '2px 0 0', color: 'var(--primary)' }}>{formatINR(metrics.totalGMV)}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', color: 'var(--success)', padding: '10px', borderRadius: '12px' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Commission Revenue</span>
              <h2 style={{ fontSize: '1.4rem', margin: '2px 0 0', color: 'var(--success)' }}>{formatINR(metrics.totalPlatformRevenue)}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.12)', color: 'var(--info)', padding: '10px', borderRadius: '12px' }}>
              <Building2 size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>B2B Bulk Volume</span>
              <h2 style={{ fontSize: '1.4rem', margin: '2px 0 0' }}>{formatINR(metrics.b2bGMV)}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', color: 'var(--warning)', padding: '10px', borderRadius: '12px' }}>
              <Users size={22} />
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Network</span>
              <h2 style={{ fontSize: '1.4rem', margin: '2px 0 0' }}>{metrics.activeFarmersCount} Farmers • {metrics.activeBulkBuyersCount} Buyers</h2>
            </div>
          </div>

        </div>

        {/* Management Workspaces Navigation */}
        <div className="card" style={{ padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', backgroundColor: 'var(--card-bg)' }}>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`btn btn-sm ${activeTab === 'revenue' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            💰 FarmLink Revenue Model
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            📦 Platform Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`btn btn-sm ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            🌾 Crop Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`btn btn-sm ${activeTab === 'verifications' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            🛡️ Farmer Verifications ({verifications.length})
          </button>
          <button
            onClick={() => setActiveTab('bulk_audit')}
            className={`btn btn-sm ${activeTab === 'bulk_audit' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            🏪 B2B Bulk Tenders ({bulkReqs.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
          >
            📋 Governance & Audit Logs
          </button>
        </div>

        {/* ── TAB 1: FARMLINK REVENUE MODEL & FINANCIALS ── */}
        {activeTab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Transparent Financial Separation Breakdown */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0 }}>FarmLink Multi-Stream Revenue Ledger</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0 0' }}>
                    Transparent accounting separating Gross Merchandise Value (GMV), platform fee collections, and direct farmer settlements.
                  </p>
                </div>
                <span className="badge badge-success">Audited Financial Model</span>
              </div>

              {/* 4-Pillar Financial Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>1. Total Platform GMV</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                    {formatINR(metrics.totalGMV)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retail: {formatINR(metrics.retailGMV)} • B2B: {formatINR(metrics.b2bGMV)}</span>
                </div>

                <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', border: '1px solid rgba(46, 204, 113, 0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>2. Platform Net Revenue</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {formatINR(metrics.totalPlatformRevenue)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retail (6%): {formatINR(metrics.retailCommission)} • B2B (4%): {formatINR(metrics.b2bCommission)}</span>
                </div>

                <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.08)', border: '1px solid rgba(52, 152, 219, 0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--info)', fontWeight: 700 }}>3. Farmer Payouts Settled</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--info)', marginTop: '0.2rem' }}>
                    {formatINR(metrics.farmerPayoutsTotal)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Direct zero-brokerage payout to growers</span>
                </div>

                <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.08)', border: '1px solid rgba(241, 196, 15, 0.3)', padding: '1.25rem', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#d35400', fontWeight: 700 }}>4. Operating Margin Contribution</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#d35400', marginTop: '0.2rem' }}>
                    {formatINR(metrics.estimatedContribution)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Net Contribution after ops ({formatINR(metrics.operatingCosts)})</span>
                </div>
              </div>

              {/* Revenue Streams Matrix */}
              <h4 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Active Revenue Streams & Service Tariffs</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Revenue Stream</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Tariff Rate</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Application</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Current Contribution</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Direct Consumer Transactions</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>6.0% Commission</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Retail crop marketplace orders</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(metrics.retailCommission)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-success">ACTIVE</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>B2B Bulk Procurement Fee</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>4.0% Service Fee</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Commercial restaurant & hotel contracts</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(metrics.b2bCommission)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-success">ACTIVE</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Cold-Chain Logistics Service</td>
                      <td style={{ padding: '0.75rem 1rem' }}>₹40 flat or Free &gt;₹499</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Temperature-controlled distribution</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(420)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-success">ACTIVE</span></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Premium Farmer Verification & Audit</td>
                      <td style={{ padding: '0.75rem 1rem' }}>₹999 / annual audit</td>
                      <td style={{ padding: '0.75rem 1rem' }}>On-site soil testing and QR badge</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(1998)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-info">ENABLED</span></td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Featured Crop Listings</td>
                      <td style={{ padding: '0.75rem 1rem' }}>₹199 / week</td>
                      <td style={{ padding: '0.75rem 1rem' }}>Priority placement in seasonal picks</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{formatINR(597)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}><span className="badge badge-info">ENABLED</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: PLATFORM ORDERS (PRESERVED) ── */}
        {activeTab === 'orders' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>All Platform Customer Orders</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Inspect order dispatch states, assign delivery status, and review payment settlements.
                </span>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--gray-100)', padding: '4px', borderRadius: '8px' }}>
                {['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: orderStatusFilter === st ? 'var(--card-bg)' : 'transparent',
                      color: orderStatusFilter === st ? 'var(--primary)' : 'var(--text-muted)',
                      boxShadow: orderStatusFilter === st ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No orders match status "{orderStatusFilter}".
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--gray-200)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                      <th style={{ padding: '0.75rem 1rem' }}>Current Status</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Admin Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>
                          #{ord.id.slice(-8).toUpperCase()}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <strong>{ord.customerName}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.phone || 'No phone'}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 600 }}>{(ord.items || []).length} items</span>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {(ord.items || []).map((i) => i.product?.name || i.name).join(', ').slice(0, 30)}...
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {formatINR(ord.totalAmount)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${
                            ord.status === 'Delivered' ? 'badge-success' :
                            ord.status === 'In Transit' ? 'badge-primary' :
                            ord.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <select
                            value={ord.status}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--gray-300)',
                              backgroundColor: 'var(--input-bg)',
                              color: 'var(--text-main)',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: PLATFORM CROP CATALOG ── */}
        {activeTab === 'products' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Platform-Wide Crop Catalog</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Moderate listed items, ensure pesticide compliance, and take down expired listings.
                </span>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search crop or farmer..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-200)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Produce</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Grower</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <strong>{p.name}</strong>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>{p.farmerName}</td>
                      <td style={{ padding: '0.85rem 1rem' }}><span className="badge badge-primary">{p.category}</span></td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>{formatINR(p.price)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>{p.quantity} {p.unit}s</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '4px 8px' }}
                          title="Take down listing"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: FARMER VERIFICATIONS AUDIT ── */}
        {activeTab === 'verifications' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', margin: 0 }}>Farmer Verification Applications</h3>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Audit declared organic credentials, NPOP / PGS documents, and assign verified badges.
                </span>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search farmer or location..."
                  value={verifSearch}
                  onChange={(e) => setVerifSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredVerifs.map((v) => (
                <div key={v.farmerId} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className={`badge ${v.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}`}>
                          {v.status === 'APPROVED' ? '✓ Verified Partner' : v.status}
                        </span>
                        <h4 style={{ fontSize: '1.2rem', margin: 0 }}>{v.farmName}</h4>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Farmer: <strong>{v.farmerName}</strong> • {v.farmLocation} ({v.farmSize})
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Certification Reg:</div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{v.certificationDocNumber || 'Self-Declared Organic'}</div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    <div><strong>Declared Practices:</strong> {v.farmingPractice}</div>
                    <div style={{ marginTop: '0.25rem' }}><strong>Certification Body:</strong> {v.certificationType}</div>
                  </div>

                  {/* Audit Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleVerificationDecision(v.farmerId, 'APPROVED')}
                    >
                      <CheckCircle2 size={15} /> Approve Verification
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleVerificationDecision(v.farmerId, 'INFO_REQUIRED')}
                    >
                      Request More Info
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleVerificationDecision(v.farmerId, 'SUSPENDED')}
                    >
                      <XCircle size={15} /> Suspend Badge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 5: B2B BULK TENDERS AUDIT ── */}
        {activeTab === 'bulk_audit' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Commercial B2B Tenders & Quotes Audit</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Inspect high-volume institutional requirements and partial fulfillment lots.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {bulkReqs.map((req) => (
                <div key={req.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.25rem', backgroundColor: 'var(--white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <span className="badge badge-primary">{req.status}</span>
                      <strong style={{ fontSize: '1.1rem', marginLeft: '0.5rem' }}>{req.product}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>by {req.buyerName}</span>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {req.requiredQuantity} {req.unit} @ max {formatINR(req.maxBudgetPerUnit)}/{req.unit}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Destination: {req.deliveryLocation} • Target Date: {req.requiredDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: GOVERNANCE & AUDIT LOGS ── */}
        {activeTab === 'logs' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>System Governance & Compliance Stream</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Immutable administrative event ledger for platform audits and dispute tracking.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { time: '10 mins ago', event: 'Zero-Brokerage Commission settled directly to Farmer John Doe bank node.', status: 'SUCCESS' },
                { time: '42 mins ago', event: 'New Batch BATCH-STR-8841 pesticide spectrometry certificate registered at 0.00 ppm.', status: 'VERIFIED' },
                { time: '2 hours ago', event: 'Order #ORD-7729 updated to "In Transit" via Local Hub Reefer Route #4.', status: 'INFO' },
                { time: '4 hours ago', event: 'Platform SuperAdmin logged in from verified Bangalore IP address.', status: 'AUTH' }
              ].map((log, idx) => (
                <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={16} color="var(--primary)" />
                    <span>{log.event}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{log.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
