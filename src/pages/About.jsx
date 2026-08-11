import React from 'react';
import { Target, Eye, Leaf, ShieldAlert } from 'lucide-react';

export default function About() {
  return (
    <div>
      <section 
        className="section" 
        style={{
          background: 'linear-gradient(rgba(30, 86, 49, 0.9), rgba(30, 86, 49, 0.95)), url("https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=1200") no-repeat center center/cover',
          color: 'var(--white)',
          textAlign: 'center',
          padding: '5rem 0'
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ color: 'var(--white)', marginBottom: '1rem', fontSize: '3rem' }}>Our Story & Mission</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Bridging the gap between agricultural producers and modern households.</p>
        </div>
      </section>

      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Why FarmLink Exists</h2>
              <p style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>
                Modern supply chains have pushed local farmers to the margins. Farmers are forced to sell their products at low wholesale prices to distributors, losing up to 70% of the retail price. At the same time, produce takes days to arrive at traditional supermarkets, losing flavor, freshness, and nutrients.
              </p>
              <p style={{ color: 'var(--text-main)' }}>
                <strong>FarmLink</strong> was created to solve this challenge. By leveraging simple digital cataloging and direct routing, we enable local farmers to keep 100% of their retail pricing while ensuring customers receive fresh, healthy harvest within hours of picking.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--primary-bg)', border: 'none' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>70%</span>
                <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Value Lost</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lost by farmers to middlemen in standard distribution lines.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--primary-bg)', border: 'none' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>100%</span>
                <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Direct Value</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Kept by our independent farmers for sustainable operations.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--primary-bg)', border: 'none' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>24h</span>
                <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Fresh Delivery</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Harvested and delivered to your doorstep within one day.</p>
              </div>
              <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--primary-bg)', border: 'none' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>500+</span>
                <h4 style={{ margin: '0.5rem 0', fontSize: '1rem' }}>Active Families</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supported in eating healthier, localized nutrition.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section" style={{ backgroundColor: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)', borderBottom: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
            <div className="card" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ backgroundColor: 'var(--primary-bg)', display: 'inline-flex', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <Target size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Mission</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                To empower local agricultural communities by creating direct, transparent marketing channels, enabling sustainable earnings for growers and delivering clean, nutritious, and traceably grown produce to regional families.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem' }}>
              <div style={{ backgroundColor: 'var(--primary-bg)', display: 'inline-flex', padding: '0.75rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <Eye size={28} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Our Vision</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                To cultivate a decentralized, food-secure future where regional farmers thrive independently of industrial monopolistic middlemen and every household has seamless access to healthy, pesticide-free, home-grown agricultural crops.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
