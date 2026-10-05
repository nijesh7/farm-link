import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cancelCustomerOrder, getCustomerOrders } from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import {
  ShoppingBag,
  MapPin,
  Phone,
  User,
  Clock,
  FileText,
  Settings,
  Save,
  ChevronDown,
  Package,
  Bell,
  Scale,
  Trash2,
  CheckCircle2,
  RotateCcw,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import {
  getUserSubscriptions,
  updateSubscriptionStatus
} from '../../services/subscriptionService';
import {
  getUserPriceAlerts,
  togglePriceAlertStatus,
  deletePriceAlert
} from '../../services/priceAlertService';
import {
  getCustomerNegotiations
} from '../../services/negotiationService';

const ORDER_STEPS = ['Pending', 'In Transit', 'Delivered'];

export default function CustomerDashboard() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'subscriptions', 'price_alerts', 'negotiations'

  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [negotiations, setNegotiations] = useState([]);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || ''
  });

  useEffect(() => {
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [userOrders, userSubs, userAlerts, userNegs] = await Promise.all([
        getCustomerOrders(currentUser.uid).catch(() => []),
        getUserSubscriptions(currentUser.uid).catch(() => []),
        getUserPriceAlerts(currentUser.uid).catch(() => []),
        getCustomerNegotiations(currentUser.uid).catch(() => [])
      ]);
      setOrders(userOrders);
      setSubscriptions(userSubs);
      setPriceAlerts(userAlerts);
      setNegotiations(userNegs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast('Profile update failed.', 'error');
    }
  };

  const handleDeleteOrder = async (order) => {
    if (!window.confirm(`Cancel order ${order.id}? The order will remain in your history as cancelled.`)) return;

    setDeletingOrderId(order.id);
    try {
      await cancelCustomerOrder(order.id, currentUser.uid);
      setOrders((currentOrders) => currentOrders.map((currentOrder) => (
        currentOrder.id === order.id ? { ...currentOrder, status: 'Cancelled' } : currentOrder
      )));
      setExpandedOrderId(null);
      showToast('Order cancelled successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('This order can no longer be cancelled.', 'error');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleSubToggle = async (subId, status) => {
    try {
      await updateSubscriptionStatus(subId, status);
      showToast(`Subscription status updated to: ${status}`, 'info');
      await loadData();
    } catch (err) {
      showToast('Failed to update subscription', 'error');
    }
  };

  const handleAlertToggle = async (alertId, currentStatus) => {
    try {
      await togglePriceAlertStatus(alertId, currentStatus);
      showToast('Price alert status updated', 'info');
      await loadData();
    } catch (err) {
      showToast('Failed to toggle alert', 'error');
    }
  };

  const handleAlertDelete = async (alertId) => {
    try {
      await deletePriceAlert(alertId);
      showToast('Price alert removed', 'info');
      await loadData();
    } catch (err) {
      showToast('Failed to delete alert', 'error');
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending' || o.status === 'In Transit').length;
  const completedCount = orders.filter((o) => o.status === 'Delivered').length;

  const formatDeliveryDate = (order) => {
    if (!order.estimatedDeliveryDate) return 'Tomorrow morning (Within 24 hrs)';
    const target = new Date(order.estimatedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(target);
    targetDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today by 6:00 PM (Express Farm Dispatch)';
    if (diffDays === 1) return 'Tomorrow morning (Within 24 hrs)';
    if (diffDays === 2) return 'In 2 days (Direct Farm Dispatch)';
    return target.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    }) + ' (Direct Dispatch)';
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              📦 Live Delivery & Customer Hub
            </span>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>Welcome, {currentUser?.name}!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track your live shipments, recurring farm baskets, price alerts, and direct grower negotiations.</p>
          </div>
          <span className="badge" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}>
            Customer Hub
          </span>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.85rem', borderRadius: '12px' }}>
              <ShoppingBag size={24} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders Placed</span>
              <h2 style={{ fontSize: '1.6rem' }}>{orders.length}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <Clock size={24} color="var(--warning)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>In Transit</span>
              <h2 style={{ fontSize: '1.6rem' }}>{pendingCount}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <Package size={24} color="var(--info)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farm Subscriptions</span>
              <h2 style={{ fontSize: '1.6rem' }}>{subscriptions.length}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '1.3rem' }}>🌍</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carbon Reduction</span>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--primary)' }}>{((orders.length || 1) * 3.4).toFixed(1)} kg</h2>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card" style={{ padding: '0.5rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
            onClick={() => setActiveTab('orders')}
          >
            📦 My Orders & Tracking ({orders.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
            onClick={() => setActiveTab('subscriptions')}
          >
            🧺 Farm Basket Subscriptions ({subscriptions.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'price_alerts' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
            onClick={() => setActiveTab('price_alerts')}
          >
            🔔 Price Drop Alerts ({priceAlerts.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'negotiations' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', borderRadius: '8px' }}
            onClick={() => setActiveTab('negotiations')}
          >
            🔄 Order Negotiations ({negotiations.length})
          </button>
        </div>

        {/* TAB 1: ORDERS & PROFILE */}
        {activeTab === 'orders' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2.5rem', alignItems: 'start' }} className="dashboard-grid">
            
            {/* Recent Orders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'end', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem' }}>Recent Orders</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Open an order to see delivery and item details.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.55rem', fontSize: '0.78rem', color: 'var(--text-muted)', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--warning)' }} /> Pending
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--info)' }} /> In transit
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success)' }} /> Delivered
                </div>
              </div>
              {orders.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                  <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h4>No Orders Placed Yet</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Browse the marketplace to order fresh agricultural harvest.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    return (
                    <div key={order.id} className="card" style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID: </span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id}</strong>
                        </div>
                        <span className={`badge ${order.status === 'Delivered' ? 'badge-success' : order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                      </div>

                      {order.status !== 'Cancelled' && (
                        <div style={{ padding: '0.85rem 0 0.35rem', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                            {ORDER_STEPS.map((step, index) => {
                              const currentStep = ORDER_STEPS.indexOf(order.status);
                              const isComplete = index <= currentStep;
                              return (
                                <div key={step} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33.33%', color: isComplete ? 'var(--primary)' : 'var(--text-muted)' }}>
                                  {index > 0 && <span style={{ position: 'absolute', height: '3px', width: '100%', right: '50%', top: '11px', backgroundColor: isComplete ? 'var(--primary)' : 'var(--gray-200)', zIndex: -1 }} />}
                                  <span style={{ width: '24px', height: '24px', display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: isComplete ? 'var(--primary)' : 'var(--gray-200)', color: 'var(--white)', fontSize: '0.72rem', fontWeight: 800 }}>{index + 1}</span>
                                  <span style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '0.35rem', textAlign: 'center' }}>{step}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            Estimated delivery: <strong style={{ color: 'var(--text-main)' }}>{formatDeliveryDate(order)}</strong>
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--gray-800)' }}>
                              {item.product?.name || item.name} <span style={{ color: 'var(--text-muted)' }}>({item.quantity} x {item.product?.unit || item.unit})</span>
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>
                              By {item.product?.farmerName || 'Farmer Partner'}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--gray-100)', paddingTop: '0.75rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</span>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Total Amount: </span>
                          <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatINR(order.totalAmount)}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        aria-expanded={isExpanded}
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                      >
                        <span>{isExpanded ? 'Hide order details' : 'View order details'}</span>
                        <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
                      </button>

                      {isExpanded && (
                        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--gray-50)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Delivery address</span>
                              <strong style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{order.deliveryAddress || 'Not provided'}</strong>
                            </div>
                            <div>
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Contact phone</span>
                              <strong style={{ fontSize: '0.9rem' }}>{order.phone || 'Not provided'}</strong>
                            </div>
                          </div>
                          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.65rem' }}>Order summary</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                            {(order.items || []).map((item, index) => (
                              <div key={`${item.product?.id || index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
                                <span>{item.product?.name || item.name} × {item.quantity}</span>
                                <strong>{formatINR((item.product?.price || item.price || 0) * item.quantity)}</strong>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                            <span>Delivery & payment</span><strong>Cash on Delivery · Local Farm delivery</strong>
                          </div>
                        </div>
                      )}

                      {order.status === 'Pending' && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDeleteOrder(order)}
                          disabled={deletingOrderId === order.id}
                          style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'rgba(217,83,79,0.35)' }}
                        >
                          {deletingOrderId === order.id ? 'Cancelling order...' : 'Cancel order'}
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile settings sidebar */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Settings size={20} color="var(--primary)" />
                  <span>Account Profile</span>
                </h3>
                {!isEditing && (
                  <button className="btn btn-outline btn-sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }} 
                      value={profileForm.name} 
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      disabled={!isEditing} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    style={{ fontSize: '0.9rem', backgroundColor: 'var(--gray-50)' }} 
                    value={currentUser?.email || ''} 
                    disabled 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel" 
                      className="form-input" 
                      style={{ paddingLeft: '2.25rem', fontSize: '0.9rem' }} 
                      value={profileForm.phone} 
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      disabled={!isEditing} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '0.85rem', top: '12px', color: 'var(--text-muted)' }} />
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      style={{ paddingLeft: '2.25rem', fontSize: '0.9rem', resize: 'vertical' }} 
                      value={profileForm.address} 
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      disabled={!isEditing} 
                      required 
                    />
                  </div>
                </div>

                {isEditing && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => { setIsEditing(false); setProfileForm({ name: currentUser?.name || '', phone: currentUser?.phone || '', address: currentUser?.address || '' }); }}>
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

          </div>
        )}

        {/* TAB 2: SUBSCRIPTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem' }}>My Recurring Farm Basket Subscriptions</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Automate seasonal fresh deliveries without manual reordering</p>
              </div>
              <Link to="/subscriptions" className="btn btn-primary btn-sm">
                + Browse New Farm Baskets
              </Link>
            </div>

            {subscriptions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Package size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>You do not have any active recurring subscriptions right now.</p>
                <Link to="/subscriptions" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                  Explore Farm Baskets
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {subscriptions.map((sub) => (
                  <div key={sub.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem' }}>{sub.basketType}</h3>
                      <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {sub.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.75rem' }}>
                      {formatINR(sub.pricePerCycle)} / {sub.frequency}
                    </div>

                    <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
                      <div><strong>Delivery Day:</strong> Every {sub.deliveryDay}</div>
                      <div><strong>Next Delivery Date:</strong> {sub.nextDeliveryDate}</div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {sub.status === 'ACTIVE' ? (
                        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => handleSubToggle(sub.id, 'PAUSED')}>
                          <PauseCircle size={15} /> Pause
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => handleSubToggle(sub.id, 'ACTIVE')}>
                          <PlayCircle size={15} /> Resume
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleSubToggle(sub.id, 'CANCELLED')}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRICE ALERTS */}
        {activeTab === 'price_alerts' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Active Price Drop Alerts</h2>

            {priceAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Bell size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>No price alerts set. Set alerts on marketplace crops to be notified when prices drop!</p>
                <Link to="/products" className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
                  Go to Marketplace
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {priceAlerts.map((alt) => (
                  <div key={alt.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '10px', padding: '1.25rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1.05rem' }}>{alt.productName}</strong>
                      <span className={`badge ${alt.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {alt.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Notify when price is <strong>{alt.condition} {formatINR(alt.targetPrice)}/{alt.unit}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleAlertToggle(alt.id, alt.status)}>
                        {alt.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                      </button>
                      <button className="btn btn-sm" style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleAlertDelete(alt.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: NEGOTIATIONS */}
        {activeTab === 'negotiations' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>My Crop Price Proposals</h2>

            {negotiations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                <Scale size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
                <p>No active price negotiations. Propose fair offers on bulk quantities directly on marketplace crops!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {negotiations.map((neg) => (
                  <div key={neg.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '10px', padding: '1.25rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <div>
                        <span className="badge badge-primary" style={{ marginBottom: '0.2rem' }}>{neg.status}</span>
                        <h4 style={{ margin: '0 0 0.2rem', fontSize: '1.1rem' }}>{neg.productName}</h4>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Farmer: {neg.farmerName}</span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Offer:</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(neg.offeredPrice)} / {neg.unit} ({neg.requestedQuantity} {neg.unit}s)
                        </div>
                      </div>
                    </div>

                    {neg.farmerCounterPrice && (
                      <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.1)', border: '1px solid rgba(241, 196, 15, 0.4)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        <strong>Farmer Counter-Offer:</strong> {formatINR(neg.farmerCounterPrice)} / {neg.unit} — "{neg.farmerResponseNote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
