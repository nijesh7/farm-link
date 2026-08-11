import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Users, ArrowRight, ShieldCheck, Heart, Truck, Award } from 'lucide-react';
import { getProducts } from '../services/firebaseDb';

const CATEGORIES = [
  { name: 'Vegetables', icon: '🌽', img: 'https://images.unsplash.com/photo-1566385278603-605b6dc7c41a?auto=format&fit=crop&q=80&w=400' },
  { name: 'Fruits', icon: '🍎', img: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=400' },
  { name: 'Grains', icon: '🌾', img: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400' },
  { name: 'Pulses', icon: '🫘', img: 'https://images.unsplash.com/photo-1585998084226-7604ed77e43e?auto=format&fit=crop&q=80&w=400' },
  { name: 'Leafy Greens', icon: '🥬', img: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=400' },
  { name: 'Dairy', icon: '🥛', img: 'https://images.unsplash.com/photo-1516448626880-186164b3f147?auto=format&fit=crop&q=80&w=400' },
  { name: 'Organic Products', icon: '🛡️', img: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400' }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    getProducts().then((products) => {
      setFeaturedProducts(products.slice(0, 3));
    }).catch(err => console.error(err));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="hero"
        style={{
          position: 'relative',
          padding: '8rem 0 6rem',
          background: 'linear-gradient(135deg, rgba(30, 86, 49, 0.95), rgba(44, 122, 75, 0.85)), url("https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200") no-repeat center center/cover',
          color: 'var(--white)',
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: 'var(--secondary)', 
              color: 'var(--gray-800)', 
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              padding: '0.4rem 1.2rem'
            }}
          >
            Direct Farm to Fork
          </span>
          <h1 
            style={{ 
              color: 'var(--white)', 
              fontSize: '3.5rem', 
              lineHeight: '1.15', 
              fontWeight: 800,
              marginBottom: '1.5rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.15)'
            }}
          >
            Fresh From Local Farms, Directly To You
          </h1>
          <p 
            style={{ 
              fontSize: '1.2rem', 
              opacity: 0.9, 
              marginBottom: '2.5rem',
              lineHeight: '1.6'
            }}
          >
            Skip the middleman. FarmLink connects you directly with independent local farmers to bring you fresh, organic, and sustainably grown produce.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              <ShoppingBag size={20} />
              <span>Shop Fresh Produce</span>
            </Link>
            <Link to="/register?role=farmer" className="btn btn-light" style={{ padding: '1rem 2rem', fontSize: '1.05rem', color: 'var(--primary)' }}>
              <Users size={20} />
              <span>Join as a Farmer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Browse Categories</h2>
            <p style={{ color: 'var(--text-muted)' }}>Explore natural goodness straight from rural gardens</p>
          </div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {CATEGORIES.map((cat) => (
              <Link 
                to={`/products?category=${cat.name}`} 
                key={cat.name}
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}
              >
                <div 
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    transition: 'var(--transition)'
                  }}
                  className="cat-icon-container"
                >
                  {cat.icon}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: '0.95rem' }}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ backgroundColor: 'var(--primary-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>How FarmLink Works</h2>
            <p style={{ color: 'var(--text-muted)' }}>Three simple steps to fresher food and better local support</p>
          </div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem'
            }}
          >
            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', border: 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                1
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Farmers List Produce</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Local farmers list their fresh vegetables, fruits, dairy, or grains, setting their own fair prices and showcasing availability.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', border: 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                2
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Customers Order</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Browse diverse farm offerings, add products to your cart, and place orders directly with multiple local growers.
              </p>
            </div>

            <div className="card" style={{ padding: '2.5rem 2rem', textAlign: 'center', border: 'none' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                3
              </div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Direct Delivery</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Orders are freshly harvested and brought to your doorstep or designated pickup locations in your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Featured Fresh Produce</h2>
              <p style={{ color: 'var(--text-muted)' }}>Top picks from our verified farmers this week</p>
            </div>
            <Link to="/products" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <span className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                    {product.category}
                  </span>
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>By {product.farmerName}</span>
                  <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem' }}>
                    {product.description}
                  </p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>${product.price}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> / {product.unit}</span>
                    </div>
                    <Link to={`/products`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section" style={{ backgroundColor: 'var(--gray-50)', borderTop: '1px solid var(--gray-100)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>For Customers</span>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem' }}>Eat Fresh, Live Healthy, Support Local</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <ShieldCheck size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>100% Quality & Traceability</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Know exactly who grew your food and how it was produced. Transparent farming practices.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <Heart size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Nutrient-Rich Produce</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Shorter transit times mean vegetables and fruits retain peak vitamins, minerals, and flavor.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <Truck size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Convenient Delivery Options</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pick up at local farm hubs or get fresh produce delivered right to your front door.</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <span className="badge" style={{ backgroundColor: 'rgba(212, 163, 115, 0.15)', color: 'var(--secondary)', marginBottom: '1rem' }}>For Farmers</span>
              <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem' }}>Get Fair Value For Your Hard Work</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <Award size={24} color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Keep 100% of Your Listing Price</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No wholesale discounts. You determine the value of your goods and keep standard retail margins.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <Users size={24} color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Build Community Connections</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Communicate directly with consumers, grow your brand reputation, and build loyal client bases.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ backgroundColor: 'var(--white)', padding: '0.5rem', borderRadius: '12px', display: 'flex', height: 'fit-content', boxShadow: 'var(--shadow-sm)' }}>
                    <ShoppingBag size={24} color="var(--secondary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Smart Sales Dashboard</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track orders, view total active listings, modify prices dynamically, and manage stock quantities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>What People Say</h2>
            <p style={{ color: 'var(--text-muted)' }}>Stories of happy consumers and satisfied growers</p>
          </div>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '2rem', flex: '1 1 300px', maxWidth: '400px' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                "The strawberries are sweet and juicy, unlike any store-bought box. Knowing I bought them directly from Farmer John makes them taste even better!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" alt="Jane" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>Jane Smith</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer, Metropolis</span>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem', flex: '1 1 300px', maxWidth: '400px' }}>
              <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                "Selling on FarmLink has allowed me to increase my profit margin by 30% compared to distributing wholesale. I can connect directly with neighbors who appreciate organic quality."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Sarah" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>Farmer Sarah Croft</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer partner, California</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to action section */}
      <section 
        className="section" 
        style={{
          background: 'var(--primary)',
          color: 'var(--white)',
          textAlign: 'center',
          borderBottom: '4px solid var(--secondary)'
        }}
      >
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ color: 'var(--white)', fontSize: '2.25rem', marginBottom: '1rem' }}>Ready to Experience Real Freshness?</h2>
          <p style={{ opacity: 0.9, marginBottom: '2.5rem' }}>
            Register today and browse listings from farmers living right in your region. Enjoy delicious food and support your local agricultural community.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register?role=customer" className="btn btn-secondary">Get Started</Link>
            <Link to="/about" className="btn btn-outline" style={{ borderColor: 'var(--white)', color: 'var(--white)' }}>Learn More</Link>
          </div>
        </div>
      </section>

      <style>{`
        .hero {
          animation: fadeLoad 0.8s ease-out;
        }
        @keyframes fadeLoad {
          from { opacity: 0; transform: scale(1.02); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
