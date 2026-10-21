import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  ShieldCheck, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  Plus, 
  Search, 
  Thermometer, 
  PhoneCall, 
  TrendingDown,
  Percent,
  Layers,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { 
  getCarpoolRoutes, 
  bookCarpoolSpace, 
  getUserCarpoolBookings, 
  offerNewCarpoolRoute 
} from '../services/logisticsService';

export default function KisanCarpool() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [routes, setRoutes] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'REEFER' | 'STANDARD'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

  // Booking Form State
  const [cratesCount, setCratesCount] = useState(25);
  const [cropType, setCropType] = useState('Tomatoes');
  const [pickupPoint, setPickupPoint] = useState('');
  const [farmerName, setFarmerName] = useState(currentUser?.displayName || 'Farmer Ramesh');
  const [farmerPhone, setFarmerPhone] = useState(currentUser?.phone || '+91 98765 43210');

  // Offer Form State
  const [newFromHub, setNewFromHub] = useState('');
  const [newToMandi, setNewToMandi] = useState('');
  const [newTruckType, setNewTruckType] = useState('3.5-Ton Tata 407 (Standard)');
  const [newVehicleNo, setNewVehicleNo] = useState('');
  const [newCapacityKg, setNewCapacityKg] = useState(3500);
  const [newRatePerCrate, setNewRatePerCrate] = useState(40);
  const [newDeparture, setNewDeparture] = useState('Tonight, 09:00 PM');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRoutes(getCarpoolRoutes());
    setUserBookings(getUserCarpoolBookings());
  };

  const handleOpenBookModal = (route) => {
    setSelectedRoute(route);
    setPickupPoint(route.stops[0] || route.fromHub);
    setShowBookModal(true);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedRoute) return;

    try {
      const booking = bookCarpoolSpace({
        routeId: selectedRoute.id,
        farmerName,
        farmerPhone,
        cropType,
        cratesCount: Number(cratesCount),
        pickupPoint
      });
      showToast(`Booking ${booking.bookingId} Confirmed! Saved ${formatINR(booking.savedAmount)}`, 'success');
      setShowBookModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const handleOfferRoute = (e) => {
    e.preventDefault();
    if (!newFromHub || !newToMandi) {
      showToast('Please fill origin and destination', 'error');
      return;
    }

    offerNewCarpoolRoute({
      fromHub: newFromHub,
      toMandi: newToMandi,
      distanceKm: 120,
      departureTime: newDeparture,
      truckType: newTruckType,
      vehicleNumber: newVehicleNo || 'MH-14-AG-2026',
      driverName: farmerName + ' (Self / Partner)',
      driverPhone: farmerPhone,
      driverRating: 5.0,
      totalCapacityKg: Number(newCapacityKg),
      bookedCapacityKg: 0,
      pooledRatePerCrate: Number(newRatePerCrate),
      privateSoloRatePerCrate: Math.round(newRatePerCrate * 2.3),
      allowedCrops: ['All Fresh Vegetables', 'Fruits'],
      stops: [newFromHub, 'Highway Toll Hub', newToMandi],
      temperatureLogged: newTruckType.includes('Reefer') ? '4°C Active Cold Chain' : 'Ambient Aerated'
    });

    showToast('Your pooled transport route has been listed!', 'success');
    setShowOfferModal(false);
    loadData();
  };

  const filteredRoutes = routes.filter((r) => {
    if (filterType === 'REEFER' && !r.truckType.toLowerCase().includes('refrigerated') && !r.truckType.toLowerCase().includes('reefer')) {
      return false;
    }
    if (filterType === 'STANDARD' && (r.truckType.toLowerCase().includes('refrigerated') || r.truckType.toLowerCase().includes('reefer'))) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.fromHub.toLowerCase().includes(q) || r.toMandi.toLowerCase().includes(q) || r.allowedCrops.some(c => c.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4d3e 0%, #0d281e 100%)',
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
              <Truck size={16} color="#4caf50" />
              <span>Smart Rural Logistics • Kisan Transport Pooling</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
              Kisan Carpool — Pooled Truck Space for Smallholders
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>
              Share truck freight with fellow farmers heading to the same city APMC mandi. Cut shipping expenses by 50–65%, prevent produce distress sales, and access refrigerated cold chains.
            </p>
          </div>

          <div style={{ position: 'absolute', right: '-15px', bottom: '-20px', opacity: 0.1, pointerEvents: 'none' }}>
            <Truck size={300} />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.15)', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <TrendingDown size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Freight Cost Cut</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>58% Cheaper</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.15)', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <Truck size={24} color="var(--info)" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Pooled Trucks</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{routes.length} En Route</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.15)', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <Thermometer size={24} color="#b78103" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cold Chain Refrigeration</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>4°C Monitored</div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid var(--gray-200)' }}>
            <div style={{ backgroundColor: 'rgba(155, 89, 182, 0.15)', padding: '0.9rem', borderRadius: 'var(--radius-md)' }}>
              <Layers size={24} color="#8e44ad" />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Transit Passes</div>
              <button 
                onClick={() => setShowBookingsModal(true)} 
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {userBookings.length} Active Pass{userBookings.length === 1 ? '' : 'es'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar: Search, Filters, and List Empty Truck Space */}
        <div className="card" style={{ padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search hub, destination mandi, or crop (e.g. Vashi, Tomatoes, Sonipat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                className={`btn ${filterType === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setFilterType('ALL')}
              >
                All Trucks
              </button>
              <button 
                className={`btn ${filterType === 'REEFER' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setFilterType('REEFER')}
              >
                ❄️ Cold Chain Only
              </button>
              <button 
                className={`btn ${filterType === 'STANDARD' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => setFilterType('STANDARD')}
              >
                🚛 Standard Dry
              </button>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setShowOfferModal(true)}
          >
            <Plus size={16} /> Offer Empty Truck Space
          </button>
        </div>

        {/* Routes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.75rem' }}>
          {filteredRoutes.map((route) => {
            const remainingKg = route.totalCapacityKg - route.bookedCapacityKg;
            const remainingCrates = Math.floor(remainingKg / 20);
            const occupancyPct = Math.min(100, Math.round((route.bookedCapacityKg / route.totalCapacityKg) * 100));
            const isCold = route.truckType.toLowerCase().includes('refrigerated') || route.truckType.toLowerCase().includes('cold');

            return (
              <div 
                key={route.id} 
                className="card" 
                style={{ padding: '1.75rem', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span className="badge" style={{ backgroundColor: isCold ? 'rgba(52, 152, 219, 0.15)' : 'rgba(46, 204, 113, 0.15)', color: isCold ? 'var(--info)' : 'var(--primary)', fontWeight: 700 }}>
                      {isCold ? '❄️ ' + route.temperatureLogged : '🌱 ' + route.temperatureLogged}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> Departs: <strong>{route.departureTime}</strong>
                    </span>
                  </div>

                  {/* Route Heading */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                      <MapPin size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                      <span>{route.fromHub}</span>
                    </div>
                    <div style={{ paddingLeft: '1.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <ArrowRight size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      to <strong>{route.toMandi}</strong> ({route.distanceKm} km)
                    </div>
                  </div>

                  {/* Vehicle & Driver details */}
                  <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Truck:</span>
                      <strong>{route.truckType} ({route.vehicleNumber})</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Driver / Partner:</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={14} color="var(--primary)" />
                        <strong>{route.driverName}</strong> (★ {route.driverRating})
                      </span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>Capacity Filled: {occupancyPct}%</span>
                      <span style={{ color: remainingCrates < 15 ? 'var(--danger)' : 'var(--primary)', fontWeight: 700 }}>
                        {remainingCrates} crates space left ({remainingKg} kg)
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${occupancyPct}%`, 
                          height: '100%', 
                          backgroundColor: occupancyPct > 85 ? 'var(--danger)' : 'var(--primary)',
                          transition: 'width 0.4s'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Pricing Comparison */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(46, 204, 113, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solo Private Rate</div>
                      <div style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {formatINR(route.privateSoloRatePerCrate)} / crate
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                        POOLED CARPOOL RATE
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatINR(route.pooledRatePerCrate)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>/ 20kg crate</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleOpenBookModal(route)}
                  disabled={remainingCrates <= 0}
                >
                  <Truck size={16} />
                  <span>{remainingCrates > 0 ? 'Reserve Space / Crates' : 'Truck Fully Booked'}</span>
                </button>
              </div>
            );
          })}
        </div>

      </div>

      {/* Booking Modal */}
      {showBookModal && selectedRoute && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-main)' }}>
                  Reserve Crates on Pooled Truck
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selectedRoute.fromHub} → {selectedRoute.toMandi}
                </div>
              </div>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                ×
              </button>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Farmer / Producer Name
                </label>
                <input 
                  type="text" 
                  value={farmerName} 
                  onChange={(e) => setFarmerName(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Phone (SMS Dispatch Alert)
                  </label>
                  <input 
                    type="text" 
                    value={farmerPhone} 
                    onChange={(e) => setFarmerPhone(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                    Crop / Produce Type
                  </label>
                  <input 
                    type="text" 
                    value={cropType} 
                    onChange={(e) => setCropType(e.target.value)} 
                    required 
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Number of Crates (approx. 20 kg each)
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max={Math.floor((selectedRoute.totalCapacityKg - selectedRoute.bookedCapacityKg) / 20)}
                  value={cratesCount} 
                  onChange={(e) => setCratesCount(e.target.value)} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Select Pickup Point along Route
                </label>
                <select 
                  value={pickupPoint} 
                  onChange={(e) => setPickupPoint(e.target.value)}
                  style={{ width: '100%' }}
                >
                  {selectedRoute.stops.map((stop, i) => (
                    <option key={i} value={stop}>{stop}</option>
                  ))}
                </select>
              </div>

              {/* Live Cost & Savings Calculator */}
              <div style={{ backgroundColor: 'var(--primary-bg)', border: '1px solid var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  <span>Solo Private Hire Cost:</span>
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    {formatINR(cratesCount * selectedRoute.privateSoloRatePerCrate)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '1.1rem', fontWeight: 800 }}>
                  <span style={{ color: 'var(--primary)' }}>Pooled Freight Payable:</span>
                  <span style={{ color: 'var(--primary)' }}>
                    {formatINR(cratesCount * selectedRoute.pooledRatePerCrate)}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, textAlign: 'right' }}>
                  🎉 You Save {formatINR((cratesCount * selectedRoute.privateSoloRatePerCrate) - (cratesCount * selectedRoute.pooledRatePerCrate))} with Kisan Carpool!
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Space Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer Truck Modal */}
      {showOfferModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Offer Empty Space on Your Truck</h3>
              <button onClick={() => setShowOfferModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleOfferRoute}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Origin Hub</label>
                  <input type="text" placeholder="e.g. Pune / Junnar" value={newFromHub} onChange={(e) => setNewFromHub(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Destination Mandi</label>
                  <input type="text" placeholder="e.g. Mumbai APMC" value={newToMandi} onChange={(e) => setNewToMandi(e.target.value)} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Truck Type</label>
                  <select value={newTruckType} onChange={(e) => setNewTruckType(e.target.value)} style={{ width: '100%' }}>
                    <option value="3.5-Ton Tata 407 (Standard)">3.5-Ton Tata 407 (Standard)</option>
                    <option value="Refrigerated 4.5-Ton Van (Cold Chain)">Refrigerated Cold Chain Van</option>
                    <option value="10-Ton Heavy Multi-Axle">10-Ton Heavy Multi-Axle</option>
                    <option value="Eco-Electric Cargo Truck">Eco-Electric Cargo Truck</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Vehicle Number</label>
                  <input type="text" placeholder="MH-12-AB-1234" value={newVehicleNo} onChange={(e) => setNewVehicleNo(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Total Capacity (Kg)</label>
                  <input type="number" value={newCapacityKg} onChange={(e) => setNewCapacityKg(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Your Rate / Crate (₹)</label>
                  <input type="number" value={newRatePerCrate} onChange={(e) => setNewRatePerCrate(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOfferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">List Carpool Route</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Bookings Modal */}
      {showBookingsModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '600px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="var(--primary)" /> My Carpool Transit Passes
              </h3>
              <button onClick={() => setShowBookingsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {userBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                No active carpool bookings yet. Reserve space on an active truck above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {userBookings.map((b) => (
                  <div key={b.bookingId} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-success">{b.status}</span>
                      <strong style={{ fontSize: '0.85rem' }}>{b.bookingId}</strong>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{b.routeSummary}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                      Crates: <strong>{b.cratesCount} ({b.weightKg} kg)</strong> • Crop: <strong>{b.cropType}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed var(--gray-300)', paddingTop: '0.5rem' }}>
                      <span>Driver: <strong>{b.driverName}</strong> ({b.driverPhone})</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Paid: {formatINR(b.totalCost)}</span>
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
