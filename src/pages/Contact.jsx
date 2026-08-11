import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast('Thank you! Your message has been sent successfully.', 'success');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)' }}>
      <section 
        className="section" 
        style={{
          background: 'linear-gradient(rgba(30, 86, 49, 0.9), rgba(30, 86, 49, 0.95)), url("https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=1200") no-repeat center center/cover',
          color: 'var(--white)',
          textAlign: 'center',
          padding: '5rem 0'
        }}
      >
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ color: 'var(--white)', marginBottom: '1rem', fontSize: '3rem' }}>Contact Us</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem' }}>Have questions? We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem' }}>
            {/* Form */}
            <div className="card" style={{ padding: '2.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Send Us a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="form-input" 
                    placeholder="Enter your full name" 
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="form-input" 
                      placeholder="Enter your email" 
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="form-input" 
                      placeholder="Enter phone number" 
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="message">Your Message *</label>
                  <textarea 
                    id="message" 
                    className="form-input" 
                    rows="5" 
                    placeholder="Write details about your question, feedback, or suggestion" 
                    style={{ resize: 'vertical' }}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                  <Send size={18} />
                  <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                </button>
              </form>
            </div>

            {/* Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Contact Information</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  If you are a farmer looking to register, or a community leader wishing to set up a delivery hub, please write to us or call our lines directly.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.75rem', borderRadius: '12px' }}>
                    <MapPin size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>Headquarters</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>100 Green Acres Rd, Organic Valley, CA 90210</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Phone size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>Phone support</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>+1 (555) FRESH-NOW (Mon-Fri 8am-6pm)</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.75rem', borderRadius: '12px' }}>
                    <Mail size={24} color="var(--primary)" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '0.1rem' }}>General Inquiry</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>support@farmlink.com</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderRadius: '20px', overflow: 'hidden', height: '220px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-200)' }}>
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600" 
                  alt="Farm Location Map Placeholder" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
