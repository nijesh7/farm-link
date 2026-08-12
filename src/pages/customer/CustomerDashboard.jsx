import React, { useState, useEffect } from 'react';
import { cancelCustomerOrder, getCustomerOrders } from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import { ShoppingBag, MapPin, Phone, User, Clock, FileText, Settings, Save, ChevronDown } from 'lucide-react';

const ORDER_STEPS = ['Pending', 'In Transit', 'Delivered'];

export default function CustomerDashboard() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
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
      getCustomerOrders(currentUser.uid)
        .then((userOrders) => setOrders(userOrders))
        .catch((err) => console.error(err));
    }
  }, [currentUser]);

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

  const pendingCount = orders.filter((o) => o.status === 'Pending' || o.status === 'In Transit').length;
  const completedCount = orders.filter((o) => o.status === 'Delivered').length;

  const formatDeliveryDate = (order) => {
    if (!order.estimatedDeliveryDate) return 'Within 2 business days';
    return new Date(order.estimatedDeliveryDate).toLocaleDateString(undefined, {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Welcome Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Welcome, {currentUser?.name}!</h1>
            <p style={{ color: 'var(--text-muted)' }}>Track your orders and manage your account settings.</p>
          </div>
          <span className="badge badge-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Account Role: Customer
          </span>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', padding: '1rem', borderRadius: '12px' }}>
              <ShoppingBag size={28} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Orders</span>
              <h2 style={{ fontSize: '1.8rem' }}>{orders.length}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', padding: '1rem', borderRadius: '12px' }}>
              <Clock size={28} color="var(--warning)" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pending Delivery</span>
              <h2 style={{ fontSize: '1.8rem' }}>{pendingCount}</h2>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', padding: '1rem', borderRadius: '12px' }}>
              <FileText size={28} color="var(--success)" />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completed Orders</span>
              <h2 style={{ fontSize: '1.8rem' }}>{completedCount}</h2>
            </div>
          </div>
        </div>

        {/* Two Columns: Orders and Profile Settings */}
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
                      {order.items.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                          <span style={{ color: 'var(--gray-800)' }}>
                            {item.product.name} <span style={{ color: 'var(--text-muted)' }}>({item.quantity} x {item.product.unit})</span>
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            By {item.product.farmerName}
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
                          <div>
                            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>Estimated delivery</span>
                            <strong style={{ fontSize: '0.9rem' }}>
                              {order.status === 'Cancelled'
                                ? 'Order cancelled'
                                : order.estimatedDeliveryDate
                                  ? formatDeliveryDate(order)
                                  : 'Within 2 business days'}
                            </strong>
                          </div>
                        </div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.65rem' }}>Order summary</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                          {order.items.map((item, index) => (
                            <div key={`${item.product.id}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.9rem' }}>
                              <span>{item.product.name} × {item.quantity}</span>
                              <strong>{formatINR(item.product.price * item.quantity)}</strong>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--gray-200)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.9rem' }}>
                          <span>Delivery & payment</span><strong>Cash on Delivery · Local delivery</strong>
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
