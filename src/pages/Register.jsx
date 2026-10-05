import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, MapPin, UserPlus, ShoppingBag, Users, ShieldCheck, Building2 } from 'lucide-react';
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
    if (roleParam === 'farmer' || roleParam === 'customer' || roleParam === 'admin' || roleParam === 'buyer') {
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
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'farmer') {
        navigate('/farmer');
      } else if (role === 'buyer') {
        navigate('/buyer');
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
      <div className="card" style={{ width: '100%', maxWidth: '640px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join FarmLink to buy direct, sell fresh produce, buy bulk commercial lots, or maintain operations</p>
        </div>

        {/* Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
          <button 
            type="button"
            className="btn"
            style={{
              padding: '0.85rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: formData.role === 'customer' ? 'var(--primary)' : 'var(--gray-200)',
              backgroundColor: formData.role === 'customer' ? 'var(--primary-bg)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('customer')}
          >
            <ShoppingBag size={20} color={formData.role === 'customer' ? 'var(--primary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>Customer</span>
          </button>

          <button 
            type="button"
            className="btn"
            style={{
              padding: '0.85rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: formData.role === 'farmer' ? 'var(--secondary)' : 'var(--gray-200)',
              backgroundColor: formData.role === 'farmer' ? 'rgba(212, 163, 115, 0.08)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('farmer')}
          >
            <Users size={20} color={formData.role === 'farmer' ? 'var(--secondary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>Farmer</span>
          </button>

          <button 
            type="button"
            className="btn"
            style={{
              padding: '0.85rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: formData.role === 'buyer' ? '#8e44ad' : 'var(--gray-200)',
              backgroundColor: formData.role === 'buyer' ? 'rgba(142, 68, 173, 0.08)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('buyer')}
          >
            <Building2 size={20} color={formData.role === 'buyer' ? '#8e44ad' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>Bulk Buyer</span>
          </button>

          <button 
            type="button"
            className="btn"
            style={{
              padding: '0.85rem 0.35rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.4rem',
              borderRadius: '12px',
              border: '2px solid',
              borderColor: formData.role === 'admin' ? 'var(--info)' : 'var(--gray-200)',
              backgroundColor: formData.role === 'admin' ? 'rgba(52, 152, 219, 0.1)' : 'var(--white)',
              color: 'var(--text-main)',
              boxShadow: 'none'
            }}
            onClick={() => handleRoleSelect('admin')}
          >
            <ShieldCheck size={20} color={formData.role === 'admin' ? 'var(--info)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>Admin</span>
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
                  placeholder="+91 9876543210" 
                  style={{ paddingLeft: '2.75rem' }}
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Address / Farm Location</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                id="address" 
                className="form-input" 
                placeholder="123 Farm Rd, Sector 4, Bangalore" 
                style={{ paddingLeft: '2.75rem' }}
                value={formData.address}
                onChange={handleChange}
                required
              />
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
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={submitting}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating account...' : `Register as ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to={`/login?role=${formData.role}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
