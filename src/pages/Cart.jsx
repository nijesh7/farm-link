import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getSubtotal, getDeliveryCharge, getTotal } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQtyChange = (productId, currentQty, maxQty, change) => {
    const target = currentQty + change;
    if (target > maxQty) {
      showToast(`Only ${maxQty} units available in stock.`, 'warning');
      return;
    }
    updateQuantity(productId, target);
  };

  const handleRemove = (productId, productName) => {
    removeFromCart(productId);
    showToast(`Removed ${productName} from cart.`, 'info');
  };

  const subtotal = getSubtotal();
  const delivery = getDeliveryCharge();
  const total = getTotal();

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={36} color="var(--primary)" />
          <span>Shopping Cart</span>
        </h1>

        {cartItems.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Cart is Empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Add some fresh organic items from our marketplace.</p>
            <Link to="/products" className="btn btn-primary">
              Shop Fresh Produce
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem', alignItems: 'start' }} className="cart-grid">
            {/* Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.product.id} 
                  className="card" 
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    gap: '1.25rem',
                    alignItems: 'center'
                  }}
                >
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.product.farmerName}</span>
                    <h4 style={{ fontSize: '1.05rem', color: 'var(--gray-800)', margin: '0.1rem 0' }}>{item.product.name}</h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {formatINR(item.product.price)} / {item.product.unit}
                    </span>
                  </div>

                  {/* Quantity adjustment controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gray-300)', borderRadius: '8px', overflow: 'hidden' }}>
                    <button 
                      style={{ padding: '0.3rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleQtyChange(item.product.id, item.quantity, item.product.quantity, -1)}
                    >
                      -
                    </button>
                    <span style={{ width: '32px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button 
                      style={{ padding: '0.3rem 0.6rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleQtyChange(item.product.id, item.quantity, item.product.quantity, 1)}
                    >
                      +
                    </button>
                  </div>

                  {/* Total price & delete */}
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--gray-800)', fontSize: '1.05rem' }}>
                      {formatINR(item.product.price * item.quantity)}
                    </div>
                    <button 
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginTop: '0.25rem', padding: '0.25rem' }}
                      onClick={() => handleRemove(item.product.id, item.product.name)}
                      title="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <Link to="/products" className="btn btn-outline" style={{ display: 'inline-flex', alignSelf: 'flex-start', gap: '0.5rem', marginTop: '1rem' }}>
                <ArrowLeft size={16} />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Cart Summary Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>{formatINR(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Charge</span>
                  <span>{delivery === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : formatINR(delivery)}</span>
                </div>
                {delivery > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--primary-bg)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                    Add <strong>{formatINR(500 - subtotal)}</strong> more to get free delivery!
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', marginBottom: '2rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>{formatINR(total)}</span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem' }}
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
