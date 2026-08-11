import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, MapPin, UserPlus, ShoppingBag, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'farmer' || roleParam === 'customer') {
      setFormData((prev) => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, address, password, confirmPassword, role } = formData;

    if (!name || !email || !phone || !address || !password || !confirmPassword) {
      showToast('All fields are required.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, phone, address, password, role });
      showToast('Account registered successfully!', 'success');
      if (role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/products');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--gray-50)', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '580px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join FarmLink to buy direct or sell fresh produce</p>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            className="btn"
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '14px',
              border: '2px solid',
              borderColor: formData.role === 'customer' ? 'var(--primary)' : 'var(--gray-200)',
              backgroundColor: formData.role === 'customer' ? 'var(--primary-bg)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('customer')}
          >
            <ShoppingBag size={22} color={formData.role === 'customer' ? 'var(--primary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600 }}>I want to Buy</span>
          </button>

          <button 
            type="button"
            className="btn"
            style={{
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '14px',
              border: '2px solid',
              borderColor: formData.role === 'farmer' ? 'var(--secondary)' : 'var(--gray-200)',
              backgroundColor: formData.role === 'farmer' ? 'rgba(212, 163, 115, 0.08)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('farmer')}
          >
            <Users size={22} color={formData.role === 'farmer' ? 'var(--secondary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600 }}>I want to Sell</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                id="name" 
                className="form-input" 
                placeholder="John Doe" 
                style={{ paddingLeft: '2.75rem' }}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="name@example.com" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  id="phone" 
                  className="form-input" 
                  placeholder="+1 (555) 000-0000" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Physical Address</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '15px', color: 'var(--text-muted)' }} />
              <textarea 
                id="address" 
                className="form-input" 
                rows="2" 
                placeholder={formData.role === 'farmer' ? 'Farm Address (e.g. 100 Valley Road, Organic Town)' : 'Delivery Address (Apartment, Street, City)'}
                style={{ paddingLeft: '2.75rem', resize: 'vertical' }}
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  id="password" 
                  className="form-input" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-input" 
                  placeholder="••••••••" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1.5rem', backgroundColor: formData.role === 'farmer' ? 'var(--secondary)' : 'var(--primary)', borderColor: formData.role === 'farmer' ? 'var(--secondary)' : 'var(--primary)' }} 
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Registering...' : `Register as ${formData.role === 'farmer' ? 'Farmer' : 'Customer'}`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Login Now
          </Link>
        </div>
      </div>
    </div>
  );
}
