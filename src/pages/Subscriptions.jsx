import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  Clock,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  XCircle,
  Plus,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import {
  getUserSubscriptions,
  createSubscription,
  updateSubscriptionStatus
} from '../services/subscriptionService';

const CURATED_BASKETS = [
  {
    id: 'bask_weekly_veg',
    name: 'Weekly Organic Harvest Basket',
    category: 'Vegetables & Leafy Greens',
    frequency: 'Weekly',
    price: 299,
    weight: '5-6 kg',
    description: 'Fresh seasonal farm vegetables picked 24 hours prior to delivery: tomatoes, spinach, cucumbers, carrots, coriander & seasonal greens.',
    popular: true,
    items: ['Baby Spinach (2 bunches)', 'Heirloom Tomatoes (2 kg)', 'Carrots (1 kg)', 'Coriander & Mint', 'Bell Peppers (500g)', 'Gourds (1 kg)']
  },
  {
    id: 'bask_monthly_grain',
    name: 'Heritage Organic Staples Box',
    category: 'Grains & Pulses',
    frequency: 'Monthly',
    price: 799,
    weight: '10-12 kg',
    description: 'Pantry staple box including stoneground heirloom wheat flour, organic pulses, cold-pressed oils, and non-GMO grains.',
    popular: false,
    items: ['Stoneground Wheat (5 kg)', 'Red Kidney Beans (2 kg)', 'Cold-Pressed Mustard Oil (1L)', 'Brown Rice (3 kg)', 'Organic Lentils (2 kg)']
  },
  {
    id: 'bask_seasonal_fruit',
    name: 'Seasonal Orchard Superfood Box',
    category: 'Fruits & Berries',
    frequency: 'Bi-Weekly',
    price: 399,
    weight: '4-5 kg',
    description: 'Peak sweetness tree-ripened orchard fruits and berries directly from high-altitude Himachal and Nilgiris farms.',
    popular: false,
    items: ['Sweet Strawberries (2 boxes)', 'Crisp Mountain Apples (1.5 kg)', 'Pomegranate (1 kg)', 'Citrus Oranges (1 kg)']
  }
];

export default function Subscriptions() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Form State
  const [subForm, setSubForm] = useState({
    basketType: 'Weekly Organic Harvest Basket',
    category: 'Vegetables & Leafy Greens',
    frequency: 'Weekly',
    deliveryDay: 'Wednesday',
    approximateWeight: '5-6 kg',
    pricePerCycle: 299,
    deliveryAddress: currentUser?.address || '',
    phone: currentUser?.phone || ''
  });

  useEffect(() => {
    if (currentUser?.uid) {
      loadSubscriptions();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getUserSubscriptions(currentUser.uid);
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
      showToast('Could not load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (basket) => {
    if (!currentUser) {
      showToast('Please sign in to create a farm basket subscription', 'error');
      return;
    }

    try {
      await createSubscription(currentUser.uid, {
        basketType: basket.name,
        category: basket.category,
        frequency: basket.frequency,
        deliveryDay: 'Wednesday',
        approximateWeight: basket.weight,
        pricePerCycle: basket.price,
        preferredItems: basket.items,
        deliveryAddress: currentUser.address,
        phone: currentUser.phone
      }, currentUser);

      showToast(`Subscribed to ${basket.name} successfully!`, 'success');
      await loadSubscriptions();
    } catch (err) {
      showToast('Failed to create subscription', 'error');
    }
  };

  const handleCustomSubscribe = async (e) => {
    e.preventDefault();
    try {
      await createSubscription(currentUser.uid, subForm, currentUser);
      showToast('Custom Farm Basket subscription activated!', 'success');
      setShowCustomModal(false);
      await loadSubscriptions();
    } catch (err) {
      showToast('Failed to activate subscription', 'error');
    }
  };

  const handleStatusToggle = async (subId, newStatus) => {
    try {
      await updateSubscriptionStatus(subId, newStatus);
      showToast(`Subscription status updated to: ${newStatus}`, 'info');
      await loadSubscriptions();
    } catch (err) {
      showToast('Failed to update subscription', 'error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)',
          color: 'var(--white)',
          padding: '2.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <Package size={16} /> Recurring Harvest Program
          </span>
          <h1 style={{ fontSize: '2.3rem', color: '#fff', marginBottom: '0.5rem' }}>Recurring Farm Basket Subscriptions</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '700px', fontSize: '1rem', lineHeight: '1.6' }}>
            Automate fresh weekly or monthly deliveries directly from verified organic farms. Pause, resume, skip, or modify delivery schedules with zero commitment lock-in.
          </p>
        </div>

        {/* Active User Subscriptions Section (if logged in & has subscriptions) */}
        {currentUser && subscriptions.length > 0 && (
          <div className="card" style={{ padding: '2rem', marginBottom: '3rem', border: '2px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>My Active Recurring Baskets</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Manage upcoming harvest deliveries, pause, or skip next cycle</p>
              </div>
              <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
                {subscriptions.filter(s => s.status === 'ACTIVE').length} Active Subscription{subscriptions.length > 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {subscriptions.map((sub) => (
                <div key={sub.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem' }}>{sub.basketType}</h3>
                    <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-success' : sub.status === 'PAUSED' ? 'badge-warning' : 'badge-danger'}`}>
                      {sub.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {formatINR(sub.pricePerCycle)} / {sub.frequency.toLowerCase()} cycle ({sub.approximateWeight})
                  </div>

                  <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div><strong>Scheduled Delivery:</strong> Every {sub.deliveryDay}</div>
                    <div><strong>Next Drop Date:</strong> {sub.nextDeliveryDate || 'Upcoming Cycle'}</div>
                    <div><strong>Completed Drops:</strong> {sub.totalDeliveriesCompleted || 0} deliveries</div>
                  </div>

                  {/* Controls */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {sub.status === 'ACTIVE' ? (
                      <>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusToggle(sub.id, 'PAUSED')}
                          style={{ flex: 1 }}
                        >
                          <PauseCircle size={15} /> Pause
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleStatusToggle(sub.id, 'SKIPPED_NEXT')}
                          style={{ flex: 1 }}
                        >
                          <RotateCcw size={15} /> Skip Next
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusToggle(sub.id, 'ACTIVE')}
                        style={{ flex: 1 }}
                      >
                        <PlayCircle size={15} /> Resume Subscription
                      </button>
                    )}

                    {sub.status !== 'CANCELLED' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this recurring farm basket?')) {
                            handleStatusToggle(sub.id, 'CANCELLED');
                          }
                        }}
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curated Baskets Catalog */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Choose a Curated Farm Basket</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Fresh harvest combinations curated according to peak seasonal nutrient availability.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {CURATED_BASKETS.map((bask) => (
              <div key={bask.id} className="card" style={{
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: bask.popular ? '2px solid var(--primary)' : '1px solid var(--gray-200)'
              }}>
                {bask.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '24px',
                    backgroundColor: 'var(--primary)',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '99px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                  {bask.frequency} Plan • {bask.weight}
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>{bask.name}</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', flex: 1 }}>
                  {bask.description}
                </p>

                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '1.25rem' }}>
                  {formatINR(bask.price)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ delivery</span>
                </div>

                {/* Contents bullet */}
                <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sample Basket Contents:</div>
                  <ul style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {bask.items.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleSubscribe(bask)}
                >
                  <ShoppingBag size={18} />
                  <span>Subscribe to Basket</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Basket Builder Callout */}
        <div className="card" style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', backgroundColor: 'var(--white)' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem' }}>Want a Custom Recurring Basket?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              Specify your family size, dietary preferences, and custom delivery frequency.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => setShowCustomModal(true)}>
            <Plus size={16} /> Configure Custom Basket
          </button>
        </div>
      </div>

      {/* Custom Modal */}
      {showCustomModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>Custom Farm Basket Configuration</h2>
              <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setShowCustomModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCustomSubscribe}>
              <div className="form-group">
                <label className="form-label">Basket Title / Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={subForm.basketType}
                  onChange={(e) => setSubForm({ ...subForm, basketType: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Frequency</label>
                  <select
                    className="form-input"
                    value={subForm.frequency}
                    onChange={(e) => setSubForm({ ...subForm, frequency: e.target.value })}
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly (Every 2 Weeks)</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Day</label>
                  <select
                    className="form-input"
                    value={subForm.deliveryDay}
                    onChange={(e) => setSubForm({ ...subForm, deliveryDay: e.target.value })}
                  >
                    <option value="Wednesday">Wednesday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Weight Preference</label>
                  <input
                    type="text"
                    className="form-input"
                    value={subForm.approximateWeight}
                    onChange={(e) => setSubForm({ ...subForm, approximateWeight: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Budget Per Cycle (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={subForm.pricePerCycle}
                    onChange={(e) => setSubForm({ ...subForm, pricePerCycle: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCustomModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Custom Subscription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
