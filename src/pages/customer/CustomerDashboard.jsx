import React, { useState, useEffect } from 'react';
import { getCustomerOrders } from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShoppingBag, MapPin, Phone, User, Clock, FileText, Settings, Save } from 'lucide-react';

export default function CustomerDashboard() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState([]);
  
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

  const pendingCount = orders.filter((o) => o.status === 'Pending' || o.status === 'In Transit').length;
  const completedCount = orders.filter((o) => o.status === 'Delivered').length;

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
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Recent Orders</h2>
            {orders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h4>No Orders Placed Yet</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Browse the marketplace to order fresh agricultural harvest.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {orders.map((order) => (
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
                        <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>${order.totalAmount.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
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
