import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Camera, ShoppingBag, Sprout } from 'lucide-react';

const STEPS = [
  { icon: ClipboardList, title: 'Create your farmer account', text: 'Register as a farmer partner to access your personal crop catalog.' },
  { icon: Sprout, title: 'Add your harvest', text: 'Enter the crop name, category, price, selling unit, and available quantity.' },
  { icon: Camera, title: 'Use category artwork', text: 'Every listing receives a reliable category image automatically, so no photo upload is needed.' },
  { icon: ShoppingBag, title: 'Manage incoming orders', text: 'Use your dashboard to monitor orders and update their delivery status.' },
];

export default function FarmerGuide() {
  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <section className="card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: 'var(--primary)', color: 'var(--white)', marginBottom: '2.5rem' }}>
          <Sprout size={44} style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ color: 'var(--white)', fontSize: '2.4rem', marginBottom: '0.75rem' }}>Farmer Selling Guide</h1>
          <p style={{ maxWidth: '650px', margin: '0 auto', opacity: 0.9, lineHeight: 1.65 }}>A quick path from today’s harvest to a visible FarmLink listing.</p>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="card" style={{ padding: '1.5rem' }}>
              <span style={{ color: 'var(--secondary)', fontWeight: 800 }}>STEP {index + 1}</span>
              <Icon size={30} color="var(--primary)" style={{ margin: '1rem 0' }} />
              <h2 style={{ fontSize: '1.15rem', marginBottom: '0.65rem' }}>{title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>{text}</p>
            </article>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/register?role=farmer" className="btn btn-primary">Become a Farmer Partner</Link>
        </div>
      </div>
    </div>
  );
}
