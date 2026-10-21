import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Clock, 
  Sparkles, 
  TrendingDown, 
  CheckCircle2, 
  Plus, 
  Building, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight,
  Layers,
  HeartHandshake,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { 
  getGroupBuyingPools, 
  joinGroupPool, 
  getUserGroupOrders, 
  createNewCommunityPool 
} from '../services/groupBuyingService';

export default function GroupBuying() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [pools, setPools] = useState([]);
  const [userOrders, setUserOrders] = useState([]);

  // Modals
  const [selectedPool, setSelectedPool] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);

  // Join Form State
  const [quantityKg, setQuantityKg] = useState(5);
  const [buyerName, setBuyerName] = useState(currentUser?.displayName || 'Pooja Verma');
  const [buyerPhone, setBuyerPhone] = useState(currentUser?.phone || '+91 98112 34567');
  const [apartmentNumber, setApartmentNumber] = useState('Tower 4, Flat 802');

  // Create Community Pool State
  const [newCommunity, setNewCommunity] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newFarmer, setNewFarmer] = useState('Anand Patil (Organic Orchards)');
  const [newTargetKg, setNewTargetKg] = useState(100);
  const [newRetailPrice, setNewRetailPrice] = useState(120);
  const [newWholesalePrice, setNewWholesalePrice] = useState(75);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setPools(getGroupBuyingPools());
    setUserOrders(getUserGroupOrders());
  };

  const handleOpenJoinModal = (pool) => {
    setSelectedPool(pool);
    setQuantityKg(pool.minOrderKg || 3);
    setShowJoinModal(true);
  };

  const handleConfirmJoin = (e) => {
    e.preventDefault();
    if (!selectedPool) return;

    try {
      const order = joinGroupPool({
        poolId: selectedPool.id,
        buyerName,
        buyerPhone,
        apartmentNumber,
        quantityKg: Number(quantityKg)
      });

      showToast(`Joined ${selectedPool.communityName} pool! Saved ${formatINR(order.userSavings)}`, 'success');
      setShowJoinModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to join group pool', 'error');
    }
  };

  const handleCreatePool = (e) => {
    e.preventDefault();
    if (!newCommunity || !newTitle) {
      showToast('Please fill community and title', 'error');
      return;
    }

    createNewCommunityPool({
      communityName: newCommunity,
      locality: newLocality || 'Metro City Sector',
      coordinatorName: buyerName + ' (Lead Organizer)',
      poolTitle: newTitle,
      farmerName: newFarmer,
      farmerLocation: 'Certified Partner Farm Hub',
      targetKg: Number(newTargetKg),
      retailPricePerKg: Number(newRetailPrice),
      wholesalePricePerKg: Number(newWholesalePrice),
      minOrderKg: 2,
      deadlineHoursLeft: 24,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      description: 'Collective direct farm pool initiated by residents to unlock wholesale harvest rates.'
    });

    showToast('Community group pool launched successfully!', 'success');
    setShowCreateModal(false);
    loadData();
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1e5631 0%, #10331d 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
              <Users size={16} color="#ffd54f" />
              <span>Apartment Society Pooling • Farm-to-Club Wholesale</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
              Community & Apartment Group Buying
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>
              Pool orders with your residential neighbors to hit direct-from-farm wholesale thresholds. Unlock 30–45% bulk discounts, zero delivery fees, and fresh same-morning harvests delivered directly to your clubhouse.
            </p>
          </div>

          <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.12, pointerEvents: 'none' }}>
            <Users size={280} />
          </div>
        </div>

        {/* How It Works Quick Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>1</div>
              <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Neighbors Join Order</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Residents add individual boxes or crates towards the society target pool.
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>2</div>
              <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Wholesale Unlocks</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Once weight milestone (e.g. 100kg) is hit, everyone gets wholesale pricing!
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>3</div>
              <h4 style={{ margin: 0, fontSize: '1.05rem' }}>Clubhouse Delivery</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Direct truck drops tagged crates at your society lobby with zero delivery charges.
            </p>
          </div>
        </div>

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
              Active Society Harvest Pools
            </h2>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Join an open collective or start a fresh pool for your residential complex
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowOrdersModal(true)}
            >
              <Layers size={16} /> My Pool Orders ({userOrders.length})
            </button>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> Start a Society Hub
            </button>
          </div>
        </div>

        {/* Pools Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {pools.map((pool) => {
            const progressPct = Math.min(100, Math.round((pool.currentKg / pool.targetKg) * 100));
            const remainingKg = Math.max(0, pool.targetKg - pool.currentKg);
            const discountPct = Math.round(((pool.retailPricePerKg - pool.wholesalePricePerKg) / pool.retailPricePerKg) * 100);

            return (
              <div 
                key={pool.id} 
                className="card" 
                style={{ overflow: 'hidden', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {/* Image with discount badge */}
                  <div style={{ position: 'relative', height: '210px', backgroundColor: '#e2e8e5' }}>
                    <img src={pool.imageUrl} alt={pool.poolTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'var(--primary)',
                      color: '#fff',
                      padding: '0.35rem 0.8rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                    }}>
                      🔥 {discountPct}% OFF WHOLESALE
                    </div>

                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      backgroundColor: 'rgba(0,0,0,0.75)',
                      color: '#fff',
                      padding: '0.3rem 0.7rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      backdropFilter: 'blur(4px)'
                    }}>
                      <Clock size={14} color="#ffd54f" />
                      <span>{pool.deadlineHoursLeft} hours left</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                    
                    {/* Society & Locality */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                      <Building size={16} />
                      <span>{pool.communityName}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                      {pool.locality}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem', lineHeight: 1.3 }}>
                      {pool.poolTitle}
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <ShieldCheck size={14} color="var(--primary)" />
                      <span>Direct from: <strong>{pool.farmerName}</strong> ({pool.farmerLocation})</span>
                    </div>

                    {/* Progress Bar towards wholesale threshold */}
                    <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--gray-200)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                        <span><strong>{pool.currentKg} kg</strong> ordered by <strong>{pool.membersJoined} families</strong></span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>Target: {pool.targetKg} kg</span>
                      </div>
                      
                      <div style={{ height: '10px', backgroundColor: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: '0.5rem' }}>
                        <div 
                          style={{ 
                            width: `${progressPct}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--primary)',
                            transition: 'width 0.4s'
                          }} 
                        />
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={14} />
                        {remainingKg === 0 
                          ? '🎉 Target reached! Free society delivery confirmed!' 
                          : `Only ${remainingKg} kg needed to lock free clubhouse truck delivery!`}
                      </div>
                    </div>

                    {/* Price Comparison */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)', marginBottom: '1.25rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supermarket Retail</div>
                        <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                          {formatINR(pool.retailPricePerKg)} / kg
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>SOCIETY POOLED RATE</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(pool.wholesalePricePerKg)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ kg</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Action */}
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => handleOpenJoinModal(pool)}
                  >
                    <ShoppingBag size={16} />
                    <span>Join Society Order</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* Join Order Modal */}
      {showJoinModal && selectedPool && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '520px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Join Collective Order</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedPool.communityName}</div>
              </div>
              <button onClick={() => setShowJoinModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleConfirmJoin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Quantity to Order (kg) — Min: {selectedPool.minOrderKg} kg
                </label>
                <input 
                  type="number" 
                  min={selectedPool.minOrderKg} 
                  max="100" 
                  value={quantityKg} 
                  onChange={(e) => setQuantityKg(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Your Name</label>
                  <input type="text" value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Phone</label>
                  <input type="text" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Apartment / Flat #</label>
                <input type="text" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} required style={{ width: '100%' }} />
              </div>

              {/* Price Calculation Box */}
              <div style={{ backgroundColor: 'var(--primary-bg)', border: '1px solid var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                  <span>Supermarket Price ({quantityKg} kg):</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{formatINR(quantityKg * selectedPool.retailPricePerKg)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  <span>Pooled Amount Payable:</span>
                  <span>{formatINR(quantityKg * selectedPool.wholesalePricePerKg)}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                  🎉 You Save {formatINR((quantityKg * selectedPool.retailPricePerKg) - (quantityKg * selectedPool.wholesalePricePerKg))} with Direct Farm Pooling!
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm & Add to Pool</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Start Society Modal */}
      {showCreateModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Start New Society Collective Pool</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleCreatePool}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Residential Complex / Society Name</label>
                <input type="text" placeholder="e.g. Prestige Shantiniketan" value={newCommunity} onChange={(e) => setNewCommunity(e.target.value)} required style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Locality / Area</label>
                  <input type="text" placeholder="e.g. Whitefield, Bengaluru" value={newLocality} onChange={(e) => setNewLocality(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Target Weight (kg)</label>
                  <input type="number" value={newTargetKg} onChange={(e) => setNewTargetKg(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Produce / Batch Title</label>
                <input type="text" placeholder="e.g. Farm Fresh Shimla Apples Harvest Pool" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Retail Price / kg (₹)</label>
                  <input type="number" value={newRetailPrice} onChange={(e) => setNewRetailPrice(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Pooled Wholesale / kg (₹)</label>
                  <input type="number" value={newWholesalePrice} onChange={(e) => setNewWholesalePrice(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Launch Society Collective</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Orders Modal */}
      {showOrdersModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '600px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="var(--primary)" /> My Society Pool Orders
              </h3>
              <button onClick={() => setShowOrdersModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {userOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                You have not joined any community pools yet. Choose an active society batch above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {userOrders.map((o) => (
                  <div key={o.orderId} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="badge badge-success">{o.status}</span>
                      <strong>{o.orderId}</strong>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{o.poolTitle}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Community: <strong>{o.communityName}</strong> • Flat: <strong>{o.apartmentNumber}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed var(--gray-300)', paddingTop: '0.4rem' }}>
                      <span>Ordered: <strong>{o.quantityKg} kg</strong> @ {formatINR(o.wholesaleRate)}/kg</span>
                      <strong style={{ color: 'var(--primary)' }}>Paid: {formatINR(o.totalAmount)} (Saved {formatINR(o.userSavings)})</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
