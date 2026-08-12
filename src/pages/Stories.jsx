import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Quote, Sprout, Users } from 'lucide-react';

const STORIES = [
  { name: 'Nijesh', role: 'Local grower', title: 'Growing a direct connection', text: '“FarmLink gives my small harvest a place to be seen. I can focus on growing quality produce while customers discover what is in season.”', color: '#d9efcf' },
  { name: 'Maya', role: 'Home cook', title: 'Better meals, closer to home', text: '“Seeing the farmer and category before I order makes shopping feel more personal. It has become my favourite way to plan weekday meals.”', color: '#ffe4c0' },
  { name: 'Arun', role: 'Community member', title: 'A stronger local food loop', text: '“Buying locally is simple here. The marketplace helps keep fresh food and local livelihoods connected.”', color: '#d6e9f7' },
];

export default function Stories() {
  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0 5rem' }}>
      <div className="container">
        <section style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
          <div style={{ width: '58px', height: '58px', display: 'grid', placeItems: 'center', borderRadius: '18px', backgroundColor: 'var(--primary-bg)', margin: '0 auto 1.25rem' }}><Heart size={29} color="var(--primary)" /></div>
          <span style={{ fontWeight: 800, color: 'var(--secondary)' }}>OUR COMMUNITY</span>
          <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 3.6rem)', margin: '0.55rem 0 1rem' }}>Fresh food is better when it brings people together.</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7 }}>Stories from the growers, cooks, and neighbours making FarmLink a more connected marketplace.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {STORIES.map((story) => (
            <article key={story.name} className="card" style={{ padding: '1.7rem', display: 'flex', flexDirection: 'column' }}>
              <Quote size={30} color="var(--primary)" fill="var(--primary-bg)" style={{ marginBottom: '1.25rem' }} />
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, flex: 1 }}>{story.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', borderTop: '1px solid var(--gray-100)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'grid', placeItems: 'center', backgroundColor: story.color, color: 'var(--primary)', fontWeight: 800 }}>{story.name[0]}</div>
                <div><strong>{story.name}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem' }}>{story.role}</span></div>
              </div>
            </article>
          ))}
        </section>

        <section className="card" style={{ marginTop: '3.5rem', padding: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', alignItems: 'center', background: 'linear-gradient(135deg, var(--primary), #276c43)', color: 'var(--white)' }}>
          <div><Sprout size={35} /><h2 style={{ color: 'var(--white)', fontSize: '1.9rem', margin: '0.7rem 0' }}>Your local harvest has a story too.</h2><p style={{ opacity: 0.88, lineHeight: 1.65 }}>Join the farmers and customers building a more local food system.</p></div>
          <div style={{ justifySelf: 'center', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}><Link to="/register?role=farmer" className="btn btn-secondary">Sell on FarmLink <ArrowRight size={17} /></Link><Link to="/products" className="btn btn-light" style={{ color: 'var(--primary)' }}>Shop local</Link></div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', color: 'var(--text-muted)' }}><Users size={18} /><span>Built around local people and seasonal food.</span></div>
      </div>
    </div>
  );
}
