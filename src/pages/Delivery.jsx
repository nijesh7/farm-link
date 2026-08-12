import React from 'react';
import { Link } from 'react-router-dom';
import { Clock3, PackageCheck, ShieldCheck, Truck } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: Clock3, title: 'Picked close to delivery', text: 'Farmers list their available harvest so your order is as fresh as possible.' },
  { icon: PackageCheck, title: 'Packed with care', text: 'Every order is prepared by the farmer who grew or sourced it.' },
  { icon: Truck, title: 'Simple delivery tracking', text: 'Check your customer dashboard as your order moves from pending to delivered.' },
];

export default function Delivery() {
  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1 }}>
      <section style={{ background: 'linear-gradient(135deg, var(--primary), #123d28)', color: 'var(--white)', padding: '5.5rem 0 6rem', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'var(--secondary)', opacity: 0.16, top: '-150px', right: '8%' }} />
        <div className="container" style={{ position: 'relative', maxWidth: '900px', textAlign: 'center' }}>
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.16)', color: 'var(--white)', padding: '0.45rem 1rem', marginBottom: '1.25rem' }}>FRESHNESS PROMISE</span>
          <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.1, marginBottom: '1.25rem' }}>From nearby farms to your table.</h1>
          <p style={{ maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7 }}>FarmLink makes it easy to discover local harvests, order confidently, and follow every order through delivery.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginTop: '-4rem', position: 'relative' }}>
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="card" style={{ padding: '1.7rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', display: 'grid', placeItems: 'center', backgroundColor: 'var(--primary-bg)', marginBottom: '1rem' }}><Icon size={24} color="var(--primary)" /></div>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '0.55rem' }}>{title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.65 }}>{text}</p>
              </article>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem', alignItems: 'center', marginTop: '4.5rem' }}>
            <div>
              <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>HOW IT WORKS</span>
              <h2 style={{ fontSize: '2.15rem', margin: '0.6rem 0 1rem' }}>A clear path from cart to doorstep.</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>Your dashboard keeps order updates in one place, while farmers prepare the produce and update its delivery status.</p>
              <Link className="btn btn-primary" to="/products">Browse fresh products</Link>
            </div>
            <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--white)' }}>
              {[['1', 'Choose your harvest'], ['2', 'Place your order'], ['3', 'Follow its status'], ['4', 'Enjoy farm-fresh food']].map(([number, text], index) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: index ? '1rem 0 0' : 0, marginTop: index ? '1rem' : 0, borderTop: index ? '1px solid var(--gray-100)' : 'none' }}>
                  <span style={{ minWidth: '34px', height: '34px', display: 'grid', placeItems: 'center', borderRadius: '50%', color: 'var(--white)', backgroundColor: 'var(--primary)', fontWeight: 800 }}>{number}</span>
                  <strong>{text}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: 'var(--primary-bg)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', textAlign: 'center', flexWrap: 'wrap' }}>
          <ShieldCheck size={28} color="var(--primary)" /><span style={{ fontWeight: 600 }}>Need help with an order?</span><Link to="/contact" style={{ color: 'var(--primary)', fontWeight: 800 }}>Contact FarmLink support</Link>
        </div>
      </section>
    </div>
  );
}
