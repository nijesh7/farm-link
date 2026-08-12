import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Sparkles, Sprout } from 'lucide-react';
import { getProducts } from '../services/firebaseDb';
import { formatINR } from '../utils/currency';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Dairy', 'Organic Products'];

export default function SeasonalPicks() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((results) => setProducts(results.filter((product) => product.quantity > 0)))
      .catch((err) => console.error('Could not load seasonal picks:', err))
      .finally(() => setLoading(false));
  }, []);

  const picks = useMemo(() => products
    .filter((product) => category === 'All' || product.category === category)
    .slice(0, 8), [category, products]);

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, paddingBottom: '5rem' }}>
      <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #153f2a, var(--primary), #4c8546)', color: 'var(--white)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '430px', height: '430px', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', right: '-120px', top: '-160px' }} />
        <div className="container" style={{ position: 'relative', maxWidth: '900px', textAlign: 'center' }}>
          <span className="badge" style={{ color: 'var(--primary)', backgroundColor: 'var(--secondary)', padding: '0.45rem 1rem', marginBottom: '1.25rem' }}><Sparkles size={15} /> FRESH THIS SEASON</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2.5rem, 6vw, 4.25rem)', lineHeight: 1.05, marginBottom: '1rem' }}>Discover what’s growing nearby.</h1>
          <p style={{ fontSize: '1.08rem', lineHeight: 1.7, maxWidth: '650px', margin: '0 auto', opacity: 0.9 }}>Explore available harvests from local FarmLink growers—simple, seasonal, and ready for your next meal.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="card" style={{ padding: '1rem', display: 'flex', gap: '0.55rem', overflowX: 'auto', marginBottom: '2.5rem', scrollbarWidth: 'none' }}>
            {CATEGORIES.map((item) => <button key={item} type="button" className="btn btn-sm" onClick={() => setCategory(item)} style={{ whiteSpace: 'nowrap', backgroundColor: category === item ? 'var(--primary)' : 'var(--white)', color: category === item ? 'var(--white)' : 'var(--text-main)', borderColor: category === item ? 'var(--primary)' : 'var(--gray-200)' }}>{item}</button>)}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div><span style={{ fontWeight: 800, color: 'var(--secondary)' }}>AVAILABLE NOW</span><h2 style={{ fontSize: '2rem', marginTop: '0.35rem' }}>{category === 'All' ? 'Seasonal harvests' : category}</h2></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{picks.length} available {picks.length === 1 ? 'pick' : 'picks'}</span>
          </div>

          {loading ? <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Finding fresh products...</div> : picks.length === 0 ? (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}><Sprout size={38} color="var(--primary)" style={{ margin: '0 auto 1rem' }} /><h3>No seasonal picks here yet</h3><p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>Try another category or check back after the next harvest.</p><button className="btn btn-outline" onClick={() => setCategory('All')}>See all categories</button></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {picks.map((product) => <article key={product.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}><span style={{ color: 'var(--primary)', fontSize: '0.78rem', fontWeight: 800 }}>{product.category}</span><h3 style={{ fontSize: '1.15rem', margin: '0.4rem 0' }}>{product.name}</h3><p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Grown by {product.farmerName}</p><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}><strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>{formatINR(product.price)} <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/{product.unit}</small></strong><Link className="btn btn-outline btn-sm" to={`/products?category=${encodeURIComponent(product.category)}`}>Shop <ArrowRight size={14} /></Link></div></div>
              </article>)}
            </div>
          )}

          <div style={{ marginTop: '3.5rem', padding: '2rem', borderRadius: '18px', backgroundColor: 'var(--primary-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}><div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}><Leaf size={30} color="var(--primary)" /><div><strong>Want even more fresh choices?</strong><p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Browse every crop listed by FarmLink farmers.</p></div></div><Link className="btn btn-primary" to="/products">Browse marketplace <ArrowRight size={16} /></Link></div>
        </div>
      </section>
    </div>
  );
}
