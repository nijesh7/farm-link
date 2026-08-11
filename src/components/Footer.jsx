import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <Leaf size={24} fill="var(--primary-light)" color="var(--primary-light)" />
              <span style={{ fontWeight: 800 }}>FarmLink</span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Connecting local farmers directly to you. Enjoy fresh, healthy, pesticide-free harvest while supporting local farming communities.
            </p>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Browse Products</Link></li>
              <li><Link to="/about">Our Mission</Link></li>
              <li><Link to="/contact">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4>Categories</h4>
            <ul className="footer-links">
              <li><Link to="/products?category=Vegetables">Vegetables</Link></li>
              <li><Link to="/products?category=Fruits">Fruits</Link></li>
              <li><Link to="/products?category=Dairy">Dairy & Eggs</Link></li>
              <li><Link to="/products?category=Organic Products">Organic Produce</Link></li>
            </ul>
          </div>

          <div>
            <h4>Get in Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="var(--secondary)" />
                <span>100 Green Acres Rd, Organic Valley</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} color="var(--secondary)" />
                <span>+1 (555) FRESH-NOW</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--secondary)" />
                <span>support@farmlink.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FarmLink Marketplace. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" style={{ hover: { color: 'var(--white)' } }}>Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
