import React, { useState } from 'react';
import { Clock3, Leaf, Search, Sparkles, Users } from 'lucide-react';

const RECIPES = [
  { title: 'Garden Vegetable Bowl', category: 'Vegetables', time: '25 min', serves: '2 servings', emoji: '🥗', color: '#dcefc8', description: 'A colourful bowl of roasted seasonal vegetables, grains, and a bright lemon dressing.' },
  { title: 'Berry Breakfast Parfait', category: 'Fruits', time: '10 min', serves: '2 servings', emoji: '🍓', color: '#ffe1e1', description: 'Fresh fruit layered with yogurt, oats, and a drizzle of honey for an easy start.' },
  { title: 'Creamy Green Soup', category: 'Leafy Greens', time: '30 min', serves: '4 servings', emoji: '🥬', color: '#cdebd7', description: 'A comforting blend of leafy greens, herbs, and farm-fresh dairy.' },
  { title: 'Hearty Pulse Stew', category: 'Pulses', time: '45 min', serves: '4 servings', emoji: '🫘', color: '#f3dcc7', description: 'Protein-rich pulses simmered with tomatoes, warm spices, and seasonal vegetables.' },
  { title: 'Golden Grain Salad', category: 'Grains', time: '20 min', serves: '3 servings', emoji: '🌾', color: '#f5e7ae', description: 'Nutty grains tossed with crisp produce, herbs, and a tangy vinaigrette.' },
  { title: 'Farmhouse Fruit Crumble', category: 'Fruits', time: '40 min', serves: '6 servings', emoji: '🍎', color: '#fde2bd', description: 'A simple baked fruit dessert with an oat topping—perfect for sharing.' },
];

export default function Recipes() {
  const [query, setQuery] = useState('');
  const visibleRecipes = RECIPES.filter((recipe) => `${recipe.title} ${recipe.category}`.toLowerCase().includes(query.toLowerCase()));

  return <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, paddingBottom: '5rem' }}>
    <section style={{ padding: '5rem 0', background: 'linear-gradient(135deg, #f5edcf, #d5e9bc)', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <span style={{ color: 'var(--primary)', fontWeight: 800 }}><Sparkles size={16} style={{ verticalAlign: 'middle' }} /> FARM-FRESH IDEAS</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', margin: '0.7rem 0 1rem' }}>Make something delicious today.</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>Simple recipes inspired by the seasonal produce available from local FarmLink growers.</p>
        <div style={{ position: 'relative', maxWidth: '480px', margin: '2rem auto 0' }}><Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} /><input className="form-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search recipes or ingredients..." style={{ paddingLeft: '2.7rem', backgroundColor: 'var(--white)' }} /></div>
      </div>
    </section>
    <section className="section"><div className="container"><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.4rem' }}>
      {visibleRecipes.map((recipe) => <article key={recipe.title} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}><div style={{ height: '155px', backgroundColor: recipe.color, display: 'grid', placeItems: 'center', fontSize: '5rem' }}>{recipe.emoji}</div><div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', flex: 1 }}><span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.78rem' }}>{recipe.category.toUpperCase()}</span><h2 style={{ fontSize: '1.25rem', margin: '0.45rem 0' }}>{recipe.title}</h2><p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>{recipe.description}</p><div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '0.9rem', marginTop: '1rem', display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}><span><Clock3 size={14} style={{ verticalAlign: 'middle' }} /> {recipe.time}</span><span><Users size={14} style={{ verticalAlign: 'middle' }} /> {recipe.serves}</span></div></div></article>)}
    </div>{visibleRecipes.length === 0 && <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><Leaf size={38} color="var(--primary)" style={{ margin: '0 auto 1rem' }} /><h3>No recipes found</h3><p style={{ color: 'var(--text-muted)' }}>Try another search term.</p></div>}</div></section>
  </div>;
}
