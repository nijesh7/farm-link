import React from 'react';
import { HeartHandshake, Leaf, MapPin, Sprout, Users } from 'lucide-react';

const IMPACTS = [
  { icon: MapPin, number: 'Local', label: 'Closer connections between farms and homes' },
  { icon: Sprout, number: 'Seasonal', label: 'Harvests that follow nature’s rhythms' },
  { icon: Users, number: 'Direct', label: 'Support that reaches independent growers' },
];

export default function Impact() {
  return <div style={{ backgroundColor: 'var(--gray-50)', flex: 1 }}>
    <section style={{ background: 'linear-gradient(135deg, #153e2a, #28633e)', color: 'var(--white)', padding: '6rem 0', textAlign: 'center' }}><div className="container" style={{ maxWidth: '820px' }}><HeartHandshake size={48} color="var(--secondary)" style={{ margin: '0 auto 1.2rem' }} /><span style={{ color: 'var(--secondary)', fontWeight: 800 }}>WHY FARM LINK</span><h1 style={{ color: 'var(--white)', fontSize: 'clamp(2.5rem, 6vw, 4.1rem)', lineHeight: 1.08, margin: '0.7rem 0 1.2rem' }}>Good food can do good things.</h1><p style={{ opacity: 0.9, fontSize: '1.08rem', lineHeight: 1.7 }}>Each local order is a small step toward a more connected, resilient, and transparent food community.</p></div></section>
    <section className="section"><div className="container"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginTop: '-4.5rem', position: 'relative' }}>{IMPACTS.map(({ icon: Icon, number, label }) => <article key={number} className="card" style={{ padding: '1.8rem', textAlign: 'center' }}><div style={{ width: '54px', height: '54px', display: 'grid', placeItems: 'center', borderRadius: '16px', backgroundColor: 'var(--primary-bg)', margin: '0 auto 1rem' }}><Icon size={27} color="var(--primary)" /></div><strong style={{ display: 'block', color: 'var(--primary)', fontSize: '1.7rem' }}>{number}</strong><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: 1.55 }}>{label}</p></article>)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center', marginTop: '4rem' }}><div><span style={{ color: 'var(--secondary)', fontWeight: 800 }}>OUR PROMISE</span><h2 style={{ fontSize: '2.2rem', margin: '0.5rem 0 1rem' }}>More trust, less distance.</h2><p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>FarmLink gives shoppers a clearer view of where their food comes from while giving growers a direct place to share what they produce. It is a marketplace designed around the people behind every harvest.</p></div><div className="card" style={{ padding: '2rem', backgroundColor: 'var(--primary-bg)' }}><Leaf size={38} color="var(--primary)" /><h3 style={{ fontSize: '1.35rem', margin: '1rem 0 0.6rem' }}>A better food loop</h3><p style={{ color: 'var(--text-muted)', lineHeight: 1.65 }}>Grow locally. Shop thoughtfully. Share the benefits with your community.</p></div></div>
    </div></section>
  </div>;
}
