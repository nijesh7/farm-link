import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, MapPin, Phone, User, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createOrder } from '../services/firebaseDb';
import { formatINR } from '../utils/currency';

export default function Checkout() {
  const { cartItems, getTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState(currentUser?.address || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Checkout Requires Authentication</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Please log in to your customer account to complete this order.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login" className="btn btn-outline">Login Account</Link>
          <Link to="/register" className="btn btn-primary">Create Account</Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address || !phone) {
      showToast('Delivery address and contact phone are required.', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showToast('Your shopping cart is empty.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customerId: currentUser.uid,
        customerName: currentUser.name,
        items: cartItems,
        totalAmount: getTotal(),
        deliveryAddress: address,
        phone: phone
      });

      setCreatedOrderId(order.id);
      setOrderComplete(true);
      clearCart();
      showToast('Order placed successfully!', 'success');
    } catch (err) {
      console.error('Order checkout failed:', err);
      showToast('Failed to place order. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem' }}>
        <div className="card" style={{ maxWidth: '540px', padding: '3.5rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <CheckCircle2 size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Thank you for shopping on FarmLink! Your local farmer has been notified and will start harvesting.
          </p>
          <div style={{ backgroundColor: 'var(--primary-bg)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
            <span>Order Reference ID: <strong>{createdOrderId}</strong></span>
            <br />
            <span>Payment Method: <strong>Cash on Delivery (COD)</strong></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/customer" className="btn btn-primary">
              <span>Go to My Dashboard</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/products" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2.5rem' }}>Checkout & Confirmation</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr', gap: '2.5rem', alignItems: 'start' }} className="checkout-grid">
          {/* Shipping Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={22} color="var(--primary)" />
              <span>Delivery Details</span>
            </h2>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="form-input" style={{ paddingLeft: '2.5rem', backgroundColor: 'var(--gray-50)' }} value={currentUser.name} disabled />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Contact Phone Number *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="tel" 
                    id="phone" 
                    className="form-input" 
                    placeholder="+1 (555) 000-0000" 
                    style={{ paddingLeft: '2.5rem' }} 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Delivery Address *</label>
                <textarea 
                  id="address" 
                  className="form-input" 
                  rows="3" 
                  placeholder="Enter apartment, street number, suite, and city" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required 
                ></textarea>
              </div>

              <div style={{ backgroundColor: 'var(--primary-bg)', padding: '1rem', borderRadius: '12px', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                💡 <strong>Cash on Delivery (COD) Flow:</strong> You will pay the farmer in cash when your fresh crops arrive.
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '2rem' }} disabled={submitting}>
                {submitting ? 'Placing Order...' : `Place Order (${formatINR(getTotal())})`}
              </button>
            </form>
          </div>

          {/* Cart Summary Panel */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>Items in Order</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {cartItems.map((item) => (
                <div key={item.product.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div style={{ flex: 1, fontSize: '0.9rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>{item.product.name}</h4>
                    <span style={{ color: 'var(--text-muted)' }}>{item.quantity} x {formatINR(item.product.price)}</span>
                  </div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{formatINR(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                <span>{formatINR(getTotal() - (getTotal() >= 500 ? 0 : 50))}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Delivery</span>
                <span>{getTotal() >= 500 ? 'FREE' : formatINR(50)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 'bold', marginTop: '0.5rem', color: 'var(--primary)' }}>
                <span>Grand Total</span>
                <span>{formatINR(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
