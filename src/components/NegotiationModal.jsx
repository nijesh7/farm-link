import React, { useState } from 'react';
import {
  MessageSquare,
  DollarSign,
  Scale,
  Send,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import { createNegotiationOffer } from '../services/negotiationService';

export default function NegotiationModal({ product, onClose, onSuccess }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [requestedQuantity, setRequestedQuantity] = useState(10);
  const [offeredPrice, setOfferedPrice] = useState(Math.round((product?.price || 50) * 0.9));
  const [customerMessage, setCustomerMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Please login to negotiate with farmer', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await createNegotiationOffer({
        customer: currentUser,
        product,
        requestedQuantity,
        offeredPrice,
        customerMessage
      });
      showToast('Offer submitted to farmer for review!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast('Failed to submit offer', 'error');
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
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Scale size={20} color="var(--primary)" /> Propose Price & Volume
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Direct negotiation with <strong>{product?.farmerName || 'the Grower'}</strong>
            </p>
          </div>
          <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ backgroundColor: 'var(--gray-100)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            <div><strong>Product:</strong> {product?.name}</div>
            <div><strong>Current Listed Price:</strong> {formatINR(product?.price)} / {product?.unit}</div>
            <div><strong>Available Inventory:</strong> {product?.quantity} {product?.unit}</div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Requested Quantity ({product?.unit}) *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                max={product?.quantity || 100}
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(parseFloat(e.target.value) || 1)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Proposed Price Per {product?.unit} (₹) *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(parseFloat(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700, marginBottom: '1rem' }}>
            Total Proposed Lot Value: {formatINR(requestedQuantity * offeredPrice)}
          </div>

          <div className="form-group">
            <label className="form-label">Note for the Farmer</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="e.g. Inquiring for weekend family event or bulk kitchen preparation..."
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
            ></textarea>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            * Note: Negotiations do not bypass standard secure checkout. Once the farmer accepts or counter-offers, the order will be ready for payment.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={16} />
              <span>{submitting ? 'Sending Offer...' : 'Send Offer to Farmer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
