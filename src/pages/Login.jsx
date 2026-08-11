import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      // Redirect based on role
      if (user.role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/products');
      }
    } catch (err) {
      showToast(err.message || 'Invalid credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--gray-50)', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to access your marketplace account</p>
        </div>

        {/* Demo helpers */}
        <div style={{ backgroundColor: 'var(--primary-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.85rem', border: '1px solid rgba(30, 86, 49, 0.15)' }}>
          <strong style={{ color: 'var(--primary)' }}>Quick Test Accounts:</strong>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div>👨‍🌾 <strong>Farmer:</strong> <code>farmer@farmlink.com</code> / <code>any</code></div>
            <div>🛒 <strong>Customer:</strong> <code>customer@farmlink.com</code> / <code>any</code></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                id="email" 
                className="form-input" 
                placeholder="email@example.com" 
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
              <a href="#" className="form-label" style={{ margin: 0, color: 'var(--primary)', fontWeight: 500 }} onClick={(e) => { e.preventDefault(); showToast('Password reset email simulated!', 'info'); }}>
                Forgot Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                className="form-input" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <input 
              type="checkbox" 
              id="remember" 
              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" style={{ fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
              Remember me on this device
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
            <LogIn size={18} />
            <span>{submitting ? 'Logging In...' : 'Login'}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
