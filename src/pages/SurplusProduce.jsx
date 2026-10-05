import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Percent,
  AlertTriangle,
  ShoppingBag,
  Leaf,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { getProducts } from '../services/firebaseDb';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

const SAMPLE_SURPLUS_CROPS = [
  {
    id: 'surplus_1',
    name: 'Vine-Ripened Heirloom Tomatoes',
    category: 'Vegetables',
    farmerName: 'Farmer John Doe',
    farmerLocation: 'Shimla Valley, Himachal Pradesh',
    originalPrice: 35,
    surplusPrice: 20,
    unit: 'kg',
    surplusQuantity: 120,
    discountPct: 42,
    harvestDate: 'Harvested 12h ago (Peak Freshness)',
    bestBefore: 'Best consumed within 6-8 days in cool dry storage',
    description: 'Abundant seasonal flush from high-yield harvest. Flawless flavor, ideal for cooking, sun-drying, or fresh salads.',
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'surplus_2',
    name: 'Organic Sweet Strawberries',
    category: 'Fruits',
    farmerName: 'Farmer Sarah Croft',
    farmerLocation: 'Hoshangabad Organic Orchards, MP',
    originalPrice: 120,
    surplusPrice: 75,
    unit: '500g box',
    surplusQuantity: 65,
    discountPct: 37,
    harvestDate: 'Morning Dew Picked Today',
    bestBefore: 'Best consumed within 4-5 days or freeze for smoothies',
    description: 'Post-harvest surplus from our morning berry harvest. Sweet, high brix sugar index, zero synthetic sprays.',
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'surplus_3',
    name: 'Crisp Baby Spinach & Greens',
    category: 'Leafy Greens',
    farmerName: 'Farmer John Doe',
    farmerLocation: 'Shimla Valley, Himachal Pradesh',
    originalPrice: 25,
    surplusPrice: 15,
    unit: 'bunch',
    surplusQuantity: 80,
    discountPct: 40,
    harvestDate: 'Harvested today at dawn',
    bestBefore: 'Refrigerate wrapped in cotton cloth for up to 7 days',
    description: 'Excess tender organic spinach bunches after completing weekly farm share distributions.',
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600',
  },
  {
    id: 'surplus_4',
    name: 'Heritage Red Kidney Beans',
    category: 'Pulses',
    farmerName: 'Farmer Ramesh Patil',
    farmerLocation: 'Ratnagiri, Maharashtra',
    originalPrice: 110,
    surplusPrice: 75,
    unit: 'kg',
    surplusQuantity: 250,
    discountPct: 31,
    harvestDate: 'Sun-dried seasonal batch',
    bestBefore: 'Store in airtight container for up to 12 months',
    description: 'Bumper crop yield of heritage non-GMO red beans. Excellent protein content.',
    imageUrl: 'https://images.unsplash.com/photo-1585998084226-7604ed77e43e?auto=format&fit=crop&q=80&w=600',
  }
];

export default function SurplusProduce() {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [surplusItems, setSurplusItems] = useState(SAMPLE_SURPLUS_CROPS);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handleAddToCart = (item) => {
    // Map to regular product schema so standard cart handles it seamlessly
    const cartProduct = {
      id: item.id,
      name: `[Surplus] ${item.name}`,
      category: item.category,
      price: item.surplusPrice,
      unit: item.unit,
      farmerName: item.farmerName,
      imageUrl: item.imageUrl,
      isSurplus: true
    };
    addToCart(cartProduct, 1);
    showToast(`Added surplus ${item.name} at ₹${item.surplusPrice}/${item.unit} to cart!`, 'success');
  };

  const filteredItems = surplusItems.filter((i) =>
    selectedCategory === 'All' ? true : i.category === selectedCategory
  );

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Mission Statement Alert */}
        <div style={{
          backgroundColor: 'rgba(46, 204, 113, 0.12)',
          border: '2px solid rgba(46, 204, 113, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem 2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '0.8rem', borderRadius: '12px', display: 'flex' }}>
            <Leaf size={28} />
          </div>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.2rem' }}>
              Zero-Waste Agricultural Surplus Gateway
            </div>
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              <strong>Surplus pricing helps farmers recover value from excess agricultural produce while offering customers lower prices.</strong> Every batch is 100% farm-fresh, verified for quality, and harvested within our normal quality timelines.
            </p>
          </div>
        </div>

        {/* Title & Filter bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', marginBottom: '0.25rem' }}>Available Surplus Batches</h1>
            <p style={{ color: 'var(--text-muted)' }}>Discounted direct farm-gate surplus lots ready for immediate harvest dispatch.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['All', 'Vegetables', 'Fruits', 'Leafy Greens', 'Pulses'].map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {filteredItems.map((item) => (
            <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', border: '1px solid var(--gray-200)' }}>
              
              {/* Image & Badges */}
              <div style={{ position: 'relative', height: '200px' }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'var(--danger)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '99px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Percent size={14} /> {item.discountPct}% OFF SURPLUS
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px'
                }}>
                  {item.surplusQuantity} {item.unit} available
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <span className="badge" style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '0.75rem' }}>
                    {item.category}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '0.4rem' }}>
                      {formatINR(item.originalPrice)}
                    </span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatINR(item.surplusPrice)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / {item.unit}</span>
                  </div>
                </div>

                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>{item.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1 }}>
                  {item.description}
                </p>

                {/* Farmer & Location */}
                <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <MapPin size={14} color="var(--primary)" /> {item.farmerName} • {item.farmerLocation}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Calendar size={14} /> {item.harvestDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <Info size={14} /> {item.bestBefore}
                  </div>
                </div>

                {/* Action */}
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleAddToCart(item)}
                >
                  <ShoppingBag size={18} />
                  <span>Add Surplus to Basket ({formatINR(item.surplusPrice)})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
