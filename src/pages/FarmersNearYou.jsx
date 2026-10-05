import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  ShieldCheck,
  Star,
  Award,
  Package,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Users
} from 'lucide-react';
import { calculateFarmerTrustScore } from '../services/analyticsService';
import FarmerChatModal from '../components/FarmerChatModal';

const SAMPLE_LOCAL_FARMERS = [
  {
    id: 'demo_farmer_001',
    farmerName: 'Farmer John Doe',
    farmName: 'Doe Heritage Valley Orchards',
    region: 'Shimla Valley District, Himachal Pradesh',
    approxDistance: 'Approx. 12 km from North Hub',
    farmSize: '18.5 Acres',
    farmingType: '100% Natural Organic (NPOP Certified)',
    cropsGrown: ['Organic Strawberries', 'Heirloom Tomatoes', 'Crisp Baby Spinach', 'Apples'],
    trustScore: 94,
    rating: 4.9,
    reviewsCount: 38,
    isVerified: true,
    verificationLabel: 'Admin Verified & NPOP Certified',
    bio: 'Pioneering organic regenerative orchard farming for over 15 years with glacier-melt drip feeding.',
    avatarUrl: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'farmer_02',
    farmerName: 'Farmer Sarah Croft',
    farmName: 'Green Valley Heritage Grains',
    region: 'Hoshangabad District, Madhya Pradesh',
    approxDistance: 'Regional Central Hub',
    farmSize: '32.0 Acres',
    farmingType: 'Vedic Organic & Heritage Seeds',
    cropsGrown: ['Whole Grain Wheat', 'Red Kidney Beans', 'Mustard Oilseeds'],
    trustScore: 91,
    rating: 4.8,
    reviewsCount: 29,
    isVerified: true,
    verificationLabel: 'Admin Verified & PGS-India Green',
    bio: 'Dedicated to heirloom grain conservation and sustainable stoneground flour processing.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'farmer_03',
    farmerName: 'Farmer Ramesh Patil',
    farmName: 'Konkan Agro Coast Farm',
    region: 'Ratnagiri Coast District, Maharashtra',
    approxDistance: 'Coastal Regional Cluster',
    farmSize: '14.0 Acres',
    farmingType: 'Natural Agroforestry & Fruit Orchards',
    cropsGrown: ['Alphonso Mangoes', 'Red Pulses', 'Organic Turmeric'],
    trustScore: 88,
    rating: 4.7,
    reviewsCount: 19,
    isVerified: false,
    verificationLabel: 'Self-Declared Organic Practice (Verification Pending)',
    bio: 'Traditional horticulturist specialized in authentic coastal fruit varieties and spice inter-cropping.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    coverImage: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800'
  }
];

export default function FarmersNearYou() {
  const [farmers, setFarmers] = useState(SAMPLE_LOCAL_FARMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeChatFarmer, setActiveChatFarmer] = useState(null);

  const regions = ['All', 'Shimla Valley', 'Hoshangabad', 'Ratnagiri', 'Bangalore Rural'];

  const filteredFarmers = farmers.filter((f) => {
    const matchesSearch =
      f.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.farmName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.cropsGrown.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = selectedRegion === 'All' || f.region.includes(selectedRegion);
    return matchesSearch && matchesRegion;
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)',
          color: 'var(--white)',
          padding: '2.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} /> Regional Grower Discovery
          </span>
          <h1 style={{ fontSize: '2.3rem', color: '#fff', marginBottom: '0.5rem' }}>Local Farmers Near You</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '700px', fontSize: '1rem', lineHeight: '1.6' }}>
            Discover local organic farmers in your district. Connect directly, view verified crop credentials, and support fair agricultural livelihoods.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by farmer name, crop, or district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {regions.map((reg) => (
                <button
                  key={reg}
                  className={`btn btn-sm ${selectedRegion === reg ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setSelectedRegion(reg)}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Farmers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {filteredFarmers.map((farmer) => (
            <div key={farmer.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--gray-200)' }}>
              
              {/* Cover & Avatar Header */}
              <div style={{ position: 'relative', height: '120px', backgroundImage: `url(${farmer.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)' }}></div>
                
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  {farmer.isVerified ? (
                    <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                      <ShieldCheck size={14} /> ✓ Verified Farmer
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
                      Verification Pending
                    </span>
                  )}
                </div>

                <div style={{ position: 'absolute', bottom: '-24px', left: '20px' }}>
                  <img
                    src={farmer.avatarUrl}
                    alt={farmer.farmerName}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--white)', boxShadow: 'var(--shadow-md)' }}
                  />
                </div>
              </div>

              {/* Body Content */}
              <div style={{ padding: '2rem 1.5rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>{farmer.farmerName}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>{farmer.farmName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                      <Star size={16} fill="var(--warning)" /> {farmer.rating}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Trust Score: {farmer.trustScore}/100</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  <MapPin size={14} color="var(--primary)" /> {farmer.region}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                  {farmer.bio}
                </p>

                {/* Crops tag list */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Active Seasonal Crops:
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {farmer.cropsGrown.map((crop, idx) => (
                      <span key={idx} className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-main)', fontSize: '0.75rem' }}>
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: 'auto' }}>
                  <Link to={`/farmer-profile/${farmer.id}`} className="btn btn-outline btn-sm" style={{ justifyContent: 'center' }}>
                    <span>View Farm</span>
                  </Link>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ justifyContent: 'center' }}
                    onClick={() => setActiveChatFarmer(farmer)}
                  >
                    <MessageSquare size={15} />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Direct Farmer Messaging Modal */}
      {activeChatFarmer && (
        <FarmerChatModal
          farmerName={activeChatFarmer.farmerName}
          productName={`farm produce from ${activeChatFarmer.farmName}`}
          onClose={() => setActiveChatFarmer(null)}
        />
      )}
    </div>
  );
}
