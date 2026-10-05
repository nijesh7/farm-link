import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  MapPin,
  Star,
  CheckCircle2,
  Package,
  MessageSquare,
  Sparkles,
  Calendar,
  Leaf,
  Droplets,
  Sun,
  FileCheck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { getFarmerVerification } from '../services/farmerVerificationService';
import { getProducts } from '../services/firebaseDb';
import { calculateFarmerTrustScore, calculateFarmerBadges } from '../services/analyticsService';
import { formatINR } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import FarmerChatModal from '../components/FarmerChatModal';

export default function FarmerPublicProfile() {
  const { farmerId = 'demo_farmer_001' } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [verification, setVerification] = useState(null);
  const [products, setProducts] = useState([]);
  const [trustData, setTrustData] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [farmerId]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [verif, allProds] = await Promise.all([
        getFarmerVerification(farmerId),
        getProducts().catch(() => [])
      ]);

      const farmerProds = allProds.filter(
        (p) => p.farmerId === farmerId || farmerId === 'demo_farmer_001'
      );

      setVerification(verif);
      setProducts(farmerProds);

      const trust = calculateFarmerTrustScore(farmerId, [], farmerProds, verif);
      setTrustData(trust);

      const earnedBadges = calculateFarmerBadges(farmerId, [], farmerProds, verif);
      setBadges(earnedBadges);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    showToast(`Added ${product.name} to cart!`, 'success');
  };

  const farmerName = verification?.farmerName || 'Farmer John Doe';
  const farmName = verification?.farmName || 'Doe Heritage Valley Orchards';
  const farmLocation = verification?.farmLocation || 'Shimla Valley, Himachal Pradesh';
  const farmSize = verification?.farmSize || '18.5 Acres';
  const farmingPractice = verification?.farmingPractice || 'Natural Vedic Farming, Zero Chemical Spray, Subsurface Drip Irrigation';
  const certification = verification?.certificationType || 'Official India Organic (NPOP) & PGS-India Green';

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Farm Hero Banner */}
        <div style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--gray-200)',
          backgroundColor: 'var(--white)'
        }}>
          <div style={{
            height: '240px',
            backgroundImage: 'url(https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
          }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }}></div>
            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '0.5rem' }}>
              {verification?.status === 'APPROVED' ? (
                <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={16} /> ✓ Verified Farmer Partner
                </span>
              ) : (
                <span className="badge badge-warning" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                  Self-Declared (Admin Verification Pending)
                </span>
              )}
            </div>
          </div>

          {/* Profile Header Details */}
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative' }}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <img
                src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=300"
                alt={farmerName}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid var(--white)',
                  marginTop: '-60px',
                  boxShadow: 'var(--shadow-md)'
                }}
              />
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{farmName}</h1>
                <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Operated by {farmerName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={16} color="var(--primary)" /> {farmLocation}
                  </span>
                  <span>•</span>
                  <span>Farm Land Size: <strong>{farmSize}</strong></span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setShowChat(true)}>
                <MessageSquare size={16} />
                <span>Message Farmer</span>
              </button>
              <a href="#products-catalog" className="btn btn-outline">
                <ShoppingBag size={16} />
                <span>View Products ({products.length})</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2-Column Info Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Left Column: Farm Story, Credentials & Practices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Leaf size={20} color="var(--primary)" /> Farm Story & Heritage
              </h2>
              <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                Located in the pristine alpine microclimate of Shimla Valley at 2,200m elevation, our family-owned orchards have practiced regenerative organic horticulture for over 15 years. We utilize pure Himalayan glacier melt fed directly through precision subsurface drip lines, enriching root resilience with aged vermicompost and indigenous bio-inoculants.
              </p>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Farming Practices & Standards</h3>
              <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem 1.25rem', borderRadius: '12px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {farmingPractice}
              </div>
            </div>

            {/* Verification & Certification Separation */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={22} color="var(--primary)" /> Verification & Certification Badges
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ border: '1px solid var(--gray-200)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                    1. Farmer Declared
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                    Pesticide-Free Vedic Agriculture
                  </div>
                </div>

                <div style={{ border: '1px solid rgba(46, 204, 113, 0.4)', backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                    2. Admin Verified
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)' }}>
                    ✓ Geo-Tagged Soil Audit Passed
                  </div>
                </div>

                <div style={{ border: '1px solid rgba(52, 152, 219, 0.4)', backgroundColor: 'rgba(52, 152, 219, 0.05)', padding: '1rem', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--info)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.3rem' }}>
                    3. Official Certification
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--info)' }}>
                    {certification}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Trust Score & Achievement Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Trust Score Breakdown */}
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.35rem' }}>Farmer Trust Score</h2>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)' }}>
                  {trustData?.hasSufficientData ? `${trustData.score}/100 ⭐` : 'Verified ⭐'}
                </div>
              </div>

              {trustData?.hasSufficientData ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                      <span>Product Quality</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★★★★★</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '96%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                      <span>Order Reliability</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★★★★★</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '94%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                      <span>Customer Feedback</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★★★★★</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
                      <span>On-Time Fulfilment</span>
                      <span style={{ color: 'var(--warning)', fontWeight: 700 }}>★★★★☆</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: '88%', height: '100%', backgroundColor: 'var(--primary)' }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Insufficient order data to display detailed trust score breakdown.
                </p>
              )}
            </div>

            {/* Achievement Badges */}
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} color="var(--primary)" /> Earned Platform Badges
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {badges.map((b) => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: '8px', backgroundColor: 'var(--gray-100)' }}>
                    <span style={{ fontSize: '1.4rem' }}>{b.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{b.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Catalog Section */}
        <div id="products-catalog" className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Farm Produce Catalog</h2>
              <p style={{ color: 'var(--text-muted)' }}>Fresh crops direct from {farmName}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {products.map((product) => (
              <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--gray-200)' }}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <span className="badge" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '0.75rem' }}>
                      {product.category}
                    </span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatINR(product.price)} / {product.unit}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                    {product.description}
                  </p>

                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag size={16} />
                    <span>Add to Basket</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showChat && (
        <FarmerChatModal
          farmerName={farmerName}
          productName={`organic harvest from ${farmName}`}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
