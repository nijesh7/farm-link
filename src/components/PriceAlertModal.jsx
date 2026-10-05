import React, { useState } from 'react';
import {
  Bell,
  DollarSign,
  TrendingDown,
  TrendingUp,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { createPriceAlert } from '../services/priceAlertService';

export default function PriceAlertModal({ productName = 'Heirloom Tomatoes', currentPrice = 40, unit = 'kg', onClose }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const isFarmer = currentUser?.role === 'farmer';
  const [targetPrice, setTargetPrice] = useState(
    isFarmer ? Math.round(currentPrice * 1.1) : Math.round(currentPrice * 0.85)
  );
  const [condition, setCondition] = useState(isFarmer ? 'REACHES' : 'BELOW');
  const [notifyVia, setNotifyVia] = useState('In-App & Push');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please sign in to set price alerts', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createPriceAlert(currentUser.uid, currentUser.role || 'customer', {
        productName,
        targetPrice,
        condition,
        currentPrice,
        unit,
        notifyVia
      });
      showToast(`Price alert activated for ${productName}!`, 'success');
      onClose();
    } catch (err) {
      showToast('Failed to set price alert', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={20} color="var(--primary)" /> Set Price Alert
          </h2>
          <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            <div><strong>Product:</strong> {productName}</div>
            <div><strong>Current Market Rate:</strong> {formatINR(currentPrice)} / {unit}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Trigger Condition</label>
            <select
              className="form-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="BELOW">Notify me when price drops BELOW target (Customer Buying Alert)</option>
              <option value="REACHES">Notify me when market rate REACHES target (Farmer Harvest Alert)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Price (₹ per {unit}) *</label>
            <input
              type="number"
              className="form-input"
              value={targetPrice}
              onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notification Channels</label>
            <select
              className="form-input"
              value={notifyVia}
              onChange={(e) => setNotifyVia(e.target.value)}
            >
              <option value="In-App & Push">In-App Notification Center & Push</option>
              <option value="Email & In-App">Email Digest & In-App</option>
              <option value="SMS">SMS Real-time</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Bell size={16} />
              <span>{submitting ? 'Setting Alert...' : 'Set Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
