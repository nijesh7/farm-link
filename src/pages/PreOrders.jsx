import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  HeartHandshake,
  Tag,
  Award,
  CheckCircle,
  Users,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CSA_HARVESTS = [
  {
    id: 'csa-mango',
    name: 'GI-Tagged Devgad Alphonso Mangoes',
    farmerName: 'Farmer Ramesh Patil',
    farmLocation: 'Devgad Coastal Belt, Maharashtra',
    category: 'Seasonal Tree Fruit',
    expectedHarvest: 'Harvesting in 2 Days (Oct 08, 2026)',
    daysLeft: 2,
    targetKg: 500,
    bookedKg: 420,
    unit: '5kg Wooden Crate (approx 12-14 pcs)',
    retailPrice: 650,
    preOrderPrice: 480,
    discountPct: 26,
    description: 'Naturally tree-ripened on the coastal Konkan laterite soils. Zero carbide ripening agents; sweet, fragrant, melt-in-the-mouth texture.',
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'csa-saffron',
    name: 'Kashmiri Mongra Saffron & Walnuts',
    farmerName: 'Farmer Ghulam Hassan',
    farmLocation: 'Pampore Karewa Plateau, Kashmir',
    category: 'Exotic Spices',
    expectedHarvest: 'Harvesting in 3 Days (Oct 09, 2026)',
    daysLeft: 3,
    targetKg: 50,
    bookedKg: 46,
    unit: '2g Saffron + 500g Organic Walnuts combo',
    retailPrice: 750,
    preOrderPrice: 540,
    discountPct: 28,
    description: 'Grade-A crimson saffron stigmas hand-plucked during dawn frost. Sourced directly from 3rd-generation artisan saffron families.',
    imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'csa-mustard',
    name: 'Cold-Pressed Raw Kachi Ghani Mustard Oil',
    farmerName: 'Farmer Baldev Singh',
    farmLocation: 'Bhatinda Organic Tracts, Punjab',
    category: 'Artisan Oils',
    expectedHarvest: 'Fresh Pressing Tomorrow (Oct 07, 2026)',
    daysLeft: 1,
    targetKg: 300,
    bookedKg: 240,
    unit: '2L Food-grade Can',
    retailPrice: 380,
    preOrderPrice: 280,
    discountPct: 26,
    description: 'Extracted using traditional slow wood presses below 40°C. Packed with natural pungency, Omega-3 fatty acids, and antioxidants.',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800'
  }
];

export default function PreOrders() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [preOrderQty, setPreOrderQty] = useState(1);
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [harvests, setHarvests] = useState(CSA_HARVESTS);
  const [myReservations, setMyReservations] = useState([]);

  const openBookingModal = (harvest) => {
    setSelectedHarvest(harvest);
    setPreOrderQty(1);
    setCustomerName(currentUser?.name || '');
    setCustomerPhone(currentUser?.phone || '');
  };

  const closeBookingModal = () => {
    setSelectedHarvest(null);
  };

  const handleConfirmPreOrder = (e) => {
    e.preventDefault();

    const reservation = {
      id: 'RES-' + Date.now().toString().slice(-6),
      harvestId: selectedHarvest.id,
      harvestName: selectedHarvest.name,
      farmerName: selectedHarvest.farmerName,
      quantity: preOrderQty,
      unit: selectedHarvest.unit,
      totalPrice: selectedHarvest.preOrderPrice * preOrderQty,
      expectedHarvest: selectedHarvest.expectedHarvest,
      bookedAt: new Date().toLocaleDateString(),
      contactName: customerName || currentUser?.name || 'Customer',
      contactPhone: customerPhone || 'Registered Account'
    };

    setHarvests((prev) =>
      prev.map((h) => {
        if (h.id === selectedHarvest.id) {
          const newBooked = Math.min(h.targetKg, h.bookedKg + preOrderQty * 5);
          return { ...h, bookedKg: newBooked };
        }
        return h;
      })
    );

    setMyReservations((prev) => [reservation, ...prev]);

    showToast(`🎉 Harvest slot reserved for ${selectedHarvest.name}! Ref: ${reservation.id}`, 'success');
    closeBookingModal();
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Banner Section */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <HeartHandshake size={14} /> Community Supported Agriculture (CSA)
          </span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Pre-Book Upcoming Seasonal Harvests
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Support local farmers before harvest begins. Lock in limited-edition, premium produce batches at up to <strong>25% OFF</strong> with zero middlemen.
          </p>
        </div>

        {/* My Active Reservations Section (if any booked) */}
        {myReservations.length > 0 && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '3rem', border: '2px solid var(--primary-light)', backgroundColor: 'var(--primary-bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <PackageCheck size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--primary)' }}>Your Active Harvest Pre-Bookings</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {myReservations.map((res) => (
                <div key={res.id} style={{ backgroundColor: 'var(--card-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{res.id}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Slot Confirmed</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.25rem' }}>{res.harvestName}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grower: {res.farmerName}</span>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--gray-100)' }}>
                    <span>Quantity: <strong>{res.quantity}x ({res.unit})</strong></span>
                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatINR(res.totalPrice)}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    📅 Expected Harvest: <strong>{res.expectedHarvest}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Harvest Pre-Order Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {harvests.map((harvest) => {
            const bookedPct = Math.round((harvest.bookedKg / harvest.targetKg) * 100);
            return (
              <div key={harvest.id} className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ position: 'relative', height: '220px' }}>
                  <img
                    src={harvest.imageUrl}
                    alt={harvest.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span className="badge badge-success" style={{ position: 'absolute', top: '1rem', left: '1rem', fontWeight: 800 }}>
                    {harvest.discountPct}% OFF Pre-Order
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={13} /> {harvest.daysLeft} days to harvest
                  </span>
                </div>

                <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By {harvest.farmerName}</span>
                  <h3 style={{ fontSize: '1.3rem', margin: '0.35rem 0 0.5rem' }}>{harvest.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <MapPin size={14} /> {harvest.farmLocation}
                  </div>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    {harvest.description}
                  </p>

                  {/* Harvest Capacity Progress */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Batch Reservation</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{bookedPct}% Reserved</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${bookedPct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>{harvest.bookedKg}kg Booked</span>
                      <span>Target: {harvest.targetKg}kg</span>
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {formatINR(harvest.preOrderPrice)}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          {formatINR(harvest.retailPrice)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{harvest.unit}</span>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => openBookingModal(harvest)}
                      style={{ padding: '0.6rem 1.1rem', fontSize: '0.88rem' }}
                    >
                      Pre-Book Slot
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Direct Farmer Guarantee Section */}
        <div className="card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Calendar size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>Direct Harvest Dispatch</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Shipped directly within 24 hours of farm picking.
            </p>
          </div>
          <div>
            <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Tag size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>Locked-in Lowest Price</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Guaranteed harvest price protection against seasonal inflation.
            </p>
          </div>
          <div>
            <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
              <Award size={22} />
            </div>
            <h4 style={{ fontSize: '1.05rem', margin: '0 0 0.35rem' }}>100% Crop Insurance</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
              Full refund or replacement in the event of adverse climate impact.
            </p>
          </div>
        </div>

      </div>

      {/* Pre-Booking Modal */}
      {selectedHarvest && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={closeBookingModal}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              backgroundColor: 'var(--card-bg)',
              padding: '2rem',
              animation: 'slideUp 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>CSA Pre-Harvest Commitment</span>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{selectedHarvest.name}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Grower: {selectedHarvest.farmerName} • {selectedHarvest.farmLocation}
            </p>

            <form onSubmit={handleConfirmPreOrder}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Select Quantity ({selectedHarvest.unit})</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-300)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setPreOrderQty(Math.max(1, preOrderQty - 1))}
                    >
                      -
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{preOrderQty}</span>
                    <button
                      type="button"
                      style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => setPreOrderQty(preOrderQty + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Total: <strong>{formatINR(selectedHarvest.preOrderPrice * preOrderQty)}</strong>
                  </span>
                </div>
              </div>

              {!currentUser && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Your Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Phone / WhatsApp</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Estimated Harvest Window:</span>
                  <strong>{selectedHarvest.expectedHarvest}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Your Direct Pre-Order Savings:</span>
                  <strong style={{ color: 'var(--success)' }}>
                    {formatINR((selectedHarvest.retailPrice - selectedHarvest.preOrderPrice) * preOrderQty)}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Confirm Pre-Order Slot
                </button>
                <button type="button" className="btn btn-outline" onClick={closeBookingModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
