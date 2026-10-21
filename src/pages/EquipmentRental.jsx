import React, { useState, useEffect } from 'react';
import { 
  Tractor, 
  MapPin, 
  Star, 
  Clock, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  Compass, 
  DollarSign, 
  Info, 
  Zap,
  Layers,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { 
  getEquipmentCatalog, 
  bookEquipment, 
  getUserEquipmentBookings, 
  listNewEquipment 
} from '../services/equipmentRentalService';

const CATEGORIES = [
  'All Machinery',
  'Tractors & Heavy Machinery',
  'Precision Agri Tech',
  'Implements & Tillage'
];

export default function EquipmentRental() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [catalog, setCatalog] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Machinery');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);

  // Booking Form State
  const [rentalType, setRentalType] = useState('ACRE'); // 'ACRE' | 'HOUR'
  const [quantity, setQuantity] = useState(3);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [farmerName, setFarmerName] = useState(currentUser?.displayName || 'Farmer Ramesh');
  const [farmerPhone, setFarmerPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [villageAddress, setVillageAddress] = useState('Survey 42, Pimpalgaon Village');

  // New Equipment Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Tractors & Heavy Machinery');
  const [newOwnerLoc, setNewOwnerLoc] = useState('');
  const [newRateHour, setNewRateHour] = useState(500);
  const [newRateAcre, setNewRateAcre] = useState(800);
  const [newOperator, setNewOperator] = useState(true);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCatalog(getEquipmentCatalog());
    setUserBookings(getUserEquipmentBookings());
  };

  const handleOpenBookModal = (machine) => {
    setSelectedMachine(machine);
    setRentalType('ACRE');
    setQuantity(machine.minRentalHours || 3);
    setShowBookModal(true);
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedMachine) return;

    try {
      const res = bookEquipment({
        equipmentId: selectedMachine.id,
        farmerName,
        farmerPhone,
        villageAddress,
        rentalType,
        quantity: Number(quantity),
        bookingDate
      });

      showToast(`Booking ${res.bookingId} reserved! Total: ${formatINR(res.totalAmount)}`, 'success');
      setShowBookModal(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Booking failed', 'error');
    }
  };

  const handleListEquipment = (e) => {
    e.preventDefault();
    if (!newName) {
      showToast('Please enter machinery title', 'error');
      return;
    }

    listNewEquipment({
      name: newName,
      category: newCategory,
      subCategory: 'Custom Implement',
      ownerName: farmerName + ' (Self)',
      ownerLocation: newOwnerLoc || 'Local Tehsil Hub (5 km)',
      phone: farmerPhone,
      imageUrl: newImage,
      ratePerHour: Number(newRateHour),
      ratePerAcre: Number(newRateAcre),
      minRentalHours: 2,
      operatorIncluded: newOperator,
      fuelPolicy: newOperator ? 'Includes Driver & Fuel' : 'Dry Machine (Fuel by Renter)',
      features: ['Checked & Inspected', 'Heavy Duty Performance'],
      isInstantBook: true
    });

    showToast('Your equipment has been listed on FarmLink Rental Hub!', 'success');
    setShowListModal(false);
    loadData();
  };

  const filteredCatalog = catalog.filter((item) => {
    if (selectedCategory !== 'All Machinery' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.ownerLocation.toLowerCase().includes(q) || item.features.some(f => f.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #2b3a30 0%, #151d18 100%)',
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
              <Tractor size={16} color="#4caf50" />
              <span>Smart Farm Mechanization • Peer-to-Peer Machinery Sharing</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
              Krishi Machinery & Spray Drone Rental
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>
              Rent heavy-duty 4WD tractors, laser land levelers, rotavators, and precision agricultural spray drones by the acre or hour. Save capital, reduce drudgery, and boost crop yields.
            </p>
          </div>

          <div style={{ position: 'absolute', right: '-10px', bottom: '-20px', opacity: 0.12, pointerEvents: 'none' }}>
            <Tractor size={280} />
          </div>
        </div>

        {/* Header Action Bar */}
        <div className="card" style={{ padding: '1.25rem 1.75rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', border: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search tractors, drone sprayers, rotavators, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowBookingsModal(true)}
            >
              <Layers size={16} /> My Rentals ({userBookings.length})
            </button>
            <button 
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onClick={() => setShowListModal(true)}
            >
              <Plus size={16} /> List Your Equipment
            </button>
          </div>
        </div>

        {/* Machinery Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.75rem' }}>
          {filteredCatalog.map((machine) => (
            <div 
              key={machine.id} 
              className="card" 
              style={{ overflow: 'hidden', border: '1px solid var(--gray-200)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Image Container with Badge */}
                <div style={{ position: 'relative', height: '210px', backgroundColor: '#eee' }}>
                  <img 
                    src={machine.imageUrl} 
                    alt={machine.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    top: '12px', 
                    left: '12px', 
                    backgroundColor: 'rgba(0,0,0,0.75)', 
                    color: '#fff', 
                    padding: '0.35rem 0.75rem', 
                    borderRadius: 'var(--radius-full)', 
                    fontSize: '0.8rem', 
                    backdropFilter: 'blur(4px)',
                    fontWeight: 600
                  }}>
                    {machine.subCategory}
                  </div>

                  <div style={{ 
                    position: 'absolute', 
                    bottom: '12px', 
                    right: '12px', 
                    backgroundColor: 'var(--card-bg)', 
                    color: 'var(--text-main)', 
                    padding: '0.3rem 0.65rem', 
                    borderRadius: 'var(--radius-sm)', 
                    fontSize: '0.8rem', 
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <Star size={14} fill="#f1c40f" color="#f1c40f" />
                    <span>{machine.rating} ({machine.completedJobs} jobs)</span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{machine.ownerLocation}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.75rem' }}>
                    {machine.name}
                  </h3>

                  {/* Highlights */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                    {machine.features.slice(0, 3).map((feat, i) => (
                      <span key={i} style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-muted)', fontSize: '0.78rem', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  {/* Operator & Fuel policy info box */}
                  <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.2rem' }}>
                      <ShieldCheck size={14} color="var(--primary)" />
                      <span>{machine.operatorIncluded ? 'Driver / Pilot Included' : 'Self-Operated'}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>{machine.fuelPolicy}</div>
                  </div>

                  {/* Pricing Display */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem', padding: '0.75rem 0', borderTop: '1px solid var(--gray-200)', borderBottom: '1px solid var(--gray-200)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per Acre Rate</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {formatINR(machine.ratePerAcre)} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ acre</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per Hour Rate</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {formatINR(machine.ratePerHour)} <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>/ hr</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => handleOpenBookModal(machine)}
                >
                  <Calendar size={16} />
                  <span>Book Equipment Slot</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Book Rental Modal */}
      {showBookModal && selectedMachine && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Book {selectedMachine.name}</h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Owner: {selectedMachine.ownerName} ({selectedMachine.phone})</div>
              </div>
              <button onClick={() => setShowBookModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleConfirmBooking}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Rental Billing Basis</label>
                  <select value={rentalType} onChange={(e) => setRentalType(e.target.value)} style={{ width: '100%' }}>
                    <option value="ACRE">By Acre ({formatINR(selectedMachine.ratePerAcre)}/acre)</option>
                    <option value="HOUR">By Hour ({formatINR(selectedMachine.ratePerHour)}/hr)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>
                    {rentalType === 'ACRE' ? 'Total Acres' : 'Total Hours'}
                  </label>
                  <input type="number" min="1" max="50" value={quantity} onChange={(e) => setQuantity(e.target.value)} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Reservation Date</label>
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Farmer Name</label>
                  <input type="text" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Phone</label>
                  <input type="text" value={farmerPhone} onChange={(e) => setFarmerPhone(e.target.value)} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Farm / Survey Location</label>
                <input type="text" value={villageAddress} onChange={(e) => setVillageAddress(e.target.value)} required style={{ width: '100%' }} />
              </div>

              {/* Price Calculation Box */}
              <div style={{ backgroundColor: 'var(--primary-bg)', border: '1px solid var(--primary-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.9rem' }}>
                  <span>Machinery Hire ({quantity} {rentalType === 'ACRE' ? 'acres' : 'hours'}):</span>
                  <span>{formatINR(quantity * (rentalType === 'ACRE' ? selectedMachine.ratePerAcre : selectedMachine.ratePerHour))}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Refundable Damage Deposit:</span>
                  <span>{formatINR(500)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--primary)', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  <span>Total Amount:</span>
                  <span>{formatINR((quantity * (rentalType === 'ACRE' ? selectedMachine.ratePerAcre : selectedMachine.ratePerHour)) + 500)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Machinery Reservation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Equipment Modal */}
      {showListModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '540px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>List Idle Farm Machinery for Rent</h3>
              <button onClick={() => setShowListModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleListEquipment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Machinery Title</label>
                <input type="text" placeholder="e.g. Sonalika DI 745 III 50HP Tractor" value={newName} onChange={(e) => setNewName(e.target.value)} required style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Category</label>
                  <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} style={{ width: '100%' }}>
                    <option value="Tractors & Heavy Machinery">Tractors & Heavy Machinery</option>
                    <option value="Precision Agri Tech">Precision Agri Tech</option>
                    <option value="Implements & Tillage">Implements & Tillage</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Your Village / Hub</label>
                  <input type="text" placeholder="e.g. Baramati Ring" value={newOwnerLoc} onChange={(e) => setNewOwnerLoc(e.target.value)} required style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Rate / Hour (₹)</label>
                  <input type="number" value={newRateHour} onChange={(e) => setNewRateHour(e.target.value)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Rate / Acre (₹)</label>
                  <input type="number" value={newRateAcre} onChange={(e) => setNewRateAcre(e.target.value)} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowListModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Machinery Listing</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Bookings Modal */}
      {showBookingsModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '600px', padding: '2rem', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="var(--primary)" /> My Machinery Bookings
              </h3>
              <button onClick={() => setShowBookingsModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            {userBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                You have not booked any farm machinery yet. Browse available equipment above!
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {userBookings.map((b) => (
                  <div key={b.bookingId} style={{ border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: 'var(--gray-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span className="badge badge-success">{b.status}</span>
                      <strong>{b.bookingId}</strong>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{b.machineName}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Date: <strong>{b.bookingDate}</strong> • Duration/Size: <strong>{b.quantity} {b.rentalType === 'ACRE' ? 'Acres' : 'Hours'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderTop: '1px dashed var(--gray-300)', paddingTop: '0.4rem' }}>
                      <span>Owner: {b.ownerName} ({b.ownerPhone})</span>
                      <strong style={{ color: 'var(--primary)' }}>Paid: {formatINR(b.totalAmount)}</strong>
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
