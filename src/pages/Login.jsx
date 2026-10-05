import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, ShoppingBag, Users, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState('customer');

  useEffect(() => {
    const requestedRole = searchParams.get('role');
    if (requestedRole === 'customer' || requestedRole === 'farmer' || requestedRole === 'admin') {
      setRole(requestedRole);
    }
  }, [searchParams]);

  const fillQuickAccount = (accEmail, accRole) => {
    setEmail(accEmail);
    setPassword('farm123');
    setRole(accRole);
    showToast(`Loaded ${accRole} credentials. Click "Sign In"!`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill out all fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (!user || (user.role && user.role !== role)) {
        await logout();
        throw new Error(`This account is registered as a ${user?.role || 'different'} role. Please switch to the ${user?.role || 'correct'} login tab.`);
      }
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'farmer') {
        navigate('/farmer');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      showToast(err.message || 'Invalid credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--gray-50)', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2.5rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)' }}>Login to access your marketplace account</p>
        </div>

        {/* 3 Role Selection Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setRole('customer')}
            style={{
              padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
              border: '2px solid', borderRadius: '12px', boxShadow: 'none', color: 'var(--text-main)',
              borderColor: role === 'customer' ? 'var(--primary)' : 'var(--gray-200)',
              backgroundColor: role === 'customer' ? 'var(--primary-bg)' : 'var(--white)',
            }}
          >
            <ShoppingBag size={20} color={role === 'customer' ? 'var(--primary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Customer</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => setRole('farmer')}
            style={{
              padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
              border: '2px solid', borderRadius: '12px', boxShadow: 'none', color: 'var(--text-main)',
              borderColor: role === 'farmer' ? 'var(--secondary)' : 'var(--gray-200)',
              backgroundColor: role === 'farmer' ? 'rgba(212, 163, 115, 0.08)' : 'var(--white)',
            }}
          >
            <Users size={20} color={role === 'farmer' ? 'var(--secondary)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Farmer</span>
          </button>

          <button
            type="button"
            className="btn"
            onClick={() => setRole('admin')}
            style={{
              padding: '0.85rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
              border: '2px solid', borderRadius: '12px', boxShadow: 'none', color: 'var(--text-main)',
              borderColor: role === 'admin' ? 'var(--info)' : 'var(--gray-200)',
              backgroundColor: role === 'admin' ? 'rgba(52, 152, 219, 0.1)' : 'var(--white)',
            }}
          >
            <ShieldCheck size={20} color={role === 'admin' ? 'var(--info)' : 'var(--text-muted)'} />
            <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>Admin</span>
          </button>
        </div>

        {/* 1-Click Quick Demo Accounts */}
        <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.9rem', borderRadius: '12px', marginBottom: '1.75rem', fontSize: '0.8rem', border: '1px solid rgba(30, 86, 49, 0.15)' }}>
          <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
            ⚡ 1-Click Demo Accounts:
          </span>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fillQuickAccount('admin@farmlink.com', 'admin')}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--info)', color: 'var(--info)',
                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🛡️ Fill Admin
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('farmer@farmlink.com', 'farmer')}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--secondary)', color: 'var(--secondary)',
                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              👨‍🌾 Fill Farmer
            </button>
            <button
              type="button"
              onClick={() => fillQuickAccount('customer@farmlink.com', 'customer')}
              style={{
                background: 'var(--card-bg)', border: '1px solid var(--primary)', color: 'var(--primary)',
                padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🛒 Fill Customer
            </button>
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
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>Remember me</span>
            </label>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            disabled={submitting}
          >
            <LogIn size={18} />
            <span>{submitting ? 'Authenticating...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to={`/register?role=${role}`} style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
}
