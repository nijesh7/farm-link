import React from 'react';
import { X, Check, Scale, ShoppingCart, Leaf, Award, MapPin } from 'lucide-react';
import { formatINR } from '../utils/currency';

// Mock nutrition / comparison metadata generator based on category & product
const getProductMeta = (product) => {
  const isFruit = product.category === 'Fruits';
  const isGreen = product.category === 'Leafy Greens';
  const isGrain = product.category === 'Grains';
  const isPulse = product.category === 'Pulses';
  const isDairy = product.category === 'Dairy';

  return {
    organicLevel: '100% Certified Bio-Organic',
    shelfLife: isGreen ? '5 - 7 Days' : isFruit ? '7 - 10 Days' : isDairy ? '10 - 14 Days' : '12 - 18 Months',
    calories: isGreen ? '23 kcal / 100g' : isFruit ? '52 kcal / 100g' : isGrain ? '340 kcal / 100g' : isPulse ? '330 kcal / 100g' : '155 kcal / 100g',
    protein: isGreen ? '2.9g' : isFruit ? '0.7g' : isGrain ? '13.2g' : isPulse ? '24.0g' : '12.6g',
    fiber: isGreen ? '2.2g' : isFruit ? '2.0g' : isGrain ? '10.7g' : isPulse ? '15.0g' : '0.0g',
    foodMiles: isGreen ? '35 km (Hyperlocal)' : isFruit ? '85 km' : '120 km',
    storageTip: isGreen ? 'Store in cotton bag in crisper' : isFruit ? 'Refrigerate unwashed' : 'Store in airtight glass jar'
  };
};

export default function ProductCompareModal({ products, onClose, onAddToCart, canShop }) {
  if (!products || products.length === 0) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          backgroundColor: 'var(--card-bg)',
          borderRadius: 'var(--radius-lg)',
          overflowY: 'auto',
          padding: '2rem',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', padding: '8px', borderRadius: '10px' }}>
              <Scale size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Produce Comparison Matrix</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Comparing {products.length} farm-fresh items side-by-side
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Matrix Comparison Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '1rem', width: '22%', backgroundColor: 'var(--gray-50)', borderBottom: '2px solid var(--gray-200)' }}>
                  Attribute
                </th>
                {products.map((p) => (
                  <th
                    key={p.id}
                    style={{
                      padding: '1rem',
                      width: `${78 / products.length}%`,
                      backgroundColor: 'var(--gray-50)',
                      borderBottom: '2px solid var(--gray-200)',
                      verticalAlign: 'top'
                    }}
                  >
                    <div style={{ height: '100px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                      <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h4 style={{ fontSize: '1rem', margin: '0 0 0.25rem' }}>{p.name}</h4>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatINR(p.price)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}> / {p.unit}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Category */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Category</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <span className="badge badge-primary">{p.category}</span>
                  </td>
                ))}
              </tr>

              {/* Verified Grower */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Verified Grower</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <strong>{p.farmerName}</strong>
                  </td>
                ))}
              </tr>

              {/* Organic Certification */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Organic Standard</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)', color: 'var(--success)', fontWeight: 600 }}>
                    ✓ {getProductMeta(p).organicLevel}
                  </td>
                ))}
              </tr>

              {/* Shelf Life */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Optimal Shelf Life</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    {getProductMeta(p).shelfLife}
                  </td>
                ))}
              </tr>

              {/* Food Miles */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Food Miles & Proximity</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{getProductMeta(p).foodMiles}</span>
                  </td>
                ))}
              </tr>

              {/* Calories & Nutrition */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Energy & Calories</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    {getProductMeta(p).calories}
                  </td>
                ))}
              </tr>

              {/* Protein Content */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Protein Content</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    <strong>{getProductMeta(p).protein}</strong>
                  </td>
                ))}
              </tr>

              {/* Dietary Fiber */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Dietary Fiber</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)' }}>
                    {getProductMeta(p).fiber}
                  </td>
                ))}
              </tr>

              {/* Storage Recommendation */}
              <tr>
                <td style={{ padding: '0.85rem 1rem', fontWeight: 600, borderBottom: '1px solid var(--gray-100)' }}>Storage Guide</td>
                {products.map((p) => (
                  <td key={p.id} style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--gray-100)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {getProductMeta(p).storageTip}
                  </td>
                ))}
              </tr>

              {/* Action row */}
              {canShop && (
                <tr>
                  <td style={{ padding: '1.25rem 1rem' }}></td>
                  {products.map((p) => (
                    <td key={p.id} style={{ padding: '1.25rem 1rem' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={() => onAddToCart(p)}
                        disabled={p.quantity === 0}
                      >
                        <ShoppingCart size={15} />
                        <span>Add {p.name.split(' ')[0]}</span>
                      </button>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
