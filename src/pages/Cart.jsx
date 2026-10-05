import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Truck,
  Clock,
  CheckCircle2,
  PackageCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getCustomerOrders } from '../services/firebaseDb';
import { formatINR } from '../utils/currency';

const ORDER_STEPS = ['Pending', 'In Transit', 'Delivered'];

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart, getSubtotal, getDeliveryCharge, getTotal } = useCart();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'orders'
  const [placedOrders, setPlacedOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Load placed orders for user
  useEffect(() => {
    if (currentUser?.uid) {
      setLoadingOrders(true);
      getCustomerOrders(currentUser.uid)
        .then((orders) => setPlacedOrders(orders))
        .catch((err) => console.error(err))
        .finally(() => setLoadingOrders(false));
    }
  }, [currentUser]);

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

  const handleCheckoutClick = () => {
    if (!currentUser) {
      showToast('Please login as a Customer to proceed to checkout.', 'info');
      navigate('/login');
      return;
    }
    if (currentUser.role !== 'customer') {
      showToast('Only customer accounts can place orders.', 'warning');
      return;
    }
    navigate('/checkout');
  };

  const formatDeliveryDate = (order) => {
    if (!order.estimatedDeliveryDate) return 'Tomorrow morning (Within 24 hrs)';
    const target = new Date(order.estimatedDeliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDay = new Date(target);
    targetDay.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today by 6:00 PM (Express Farm Dispatch)';
    if (diffDays === 1) return 'Tomorrow morning (Within 24 hrs)';
    if (diffDays === 2) return 'In 2 days (Direct Farm Dispatch)';
    return target.toLocaleDateString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
    }) + ' (Direct Dispatch)';
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header with Tab Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={34} color="var(--primary)" />
              <span>Shopping Basket & Orders</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
              Review items in your cart and track the real-time status of your placed farm orders.
            </p>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--gray-200)', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            <button
              onClick={() => setActiveTab('cart')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: activeTab === 'cart' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'cart' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'cart' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <ShoppingBag size={16} />
              <span>Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: activeTab === 'orders' ? 'var(--card-bg)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: activeTab === 'orders' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Truck size={16} />
              <span>Placed Orders ({placedOrders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Shopping Cart */}
        {activeTab === 'cart' && (
          <div>
            {cartItems.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <ShoppingBag size={52} color="var(--text-muted)" style={{ margin: '0 auto 1.5rem' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Your Basket is Currently Empty</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                  Explore fresh organic vegetables, fruits, and dairy from local farmers.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/products" className="btn btn-primary">
                    Shop Fresh Produce
                  </Link>
                  <button onClick={() => setActiveTab('orders')} className="btn btn-outline">
                    <Truck size={16} />
                    <span>View Placed Orders</span>
                  </button>
                </div>
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
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Grower: {item.product.farmerName}</span>
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

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                    <Link to="/products" className="btn btn-outline" style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <ArrowLeft size={16} />
                      <span>Continue Shopping</span>
                    </Link>

                    <button
                      onClick={() => setActiveTab('orders')}
                      className="btn btn-outline"
                      style={{ display: 'inline-flex', gap: '0.5rem' }}
                    >
                      <Truck size={16} />
                      <span>Track Existing Orders</span>
                    </button>
                  </div>
                </div>

                {/* Cart Summary Card */}
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.75rem' }}>
                    Order Summary
                  </h3>
                  
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
                        Add <strong>{formatINR(300 - subtotal)}</strong> more to get free delivery!
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', borderTop: '1px solid var(--gray-100)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                    <span>Total Amount</span>
                    <span style={{ color: 'var(--primary)' }}>{formatINR(total)}</span>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '1rem', marginBottom: '1.5rem', fontSize: '1.05rem', fontWeight: 700 }}
                    onClick={handleCheckoutClick}
                  >
                    Proceed to Checkout
                  </button>

                  {/* Eco-Impact & Carbon Footprint Widget */}
                  <div style={{ backgroundColor: 'var(--primary-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--primary-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1rem' }}>🌱</span>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', margin: 0, fontWeight: 700 }}>
                        Your Direct Order Eco-Impact
                      </h4>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Food Miles Prevented:</span>
                        <strong>~{(cartItems.length * 280).toLocaleString()} km</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>CO₂ Emissions Saved:</span>
                        <strong style={{ color: 'var(--success)' }}>{(cartItems.length * 1.85).toFixed(1)} kg CO₂e</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Direct Farmer Pay Rate:</span>
                        <strong style={{ color: 'var(--primary)' }}>88% Fair Direct Cut</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Placed Orders & Live Tracking */}
        {activeTab === 'orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!currentUser ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <Truck size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Sign In to View Your Placed Orders</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
                  Log in to track real-time delivery status, view invoices, and inspect farmer harvest dispatch updates.
                </p>
                <Link to="/login" className="btn btn-primary">
                  Sign In to Track Orders
                </Link>
              </div>
            ) : loadingOrders ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <Clock size={36} color="var(--primary)" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading your placed orders...</p>
              </div>
            ) : placedOrders.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
                <PackageCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Placed Orders Found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  You haven't placed any farm orders yet. Start adding fresh crops to your basket!
                </p>
                <Link to="/products" className="btn btn-primary">
                  Explore Fresh Produce
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {placedOrders.map((order) => {
                  const isExpanded = expandedOrderId === order.id;
                  const currentStepIndex = ORDER_STEPS.indexOf(order.status);
                  const isCancelled = order.status === 'Cancelled';

                  return (
                    <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                      {/* Order Header Bar */}
                      <div 
                        style={{ 
                          padding: '1.25rem 1.5rem', 
                          backgroundColor: 'var(--gray-50)', 
                          borderBottom: '1px solid var(--gray-200)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', padding: '10px', borderRadius: '10px' }}>
                            <Truck size={20} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'monospace' }}>
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h4>
                              <span className={`badge ${
                                order.status === 'Delivered' ? 'badge-success' :
                                order.status === 'In Transit' ? 'badge-primary' :
                                order.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Amount</span>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 800 }}>
                              {formatINR(order.totalAmount)}
                            </h4>
                          </div>

                          <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                          >
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </button>
                        </div>
                      </div>

                      {/* Live Tracking Visual Steps */}
                      {!isCancelled && (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderBottom: isExpanded ? '1px solid var(--gray-100)' : 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                            {/* Connecting Line */}
                            <div 
                              style={{ 
                                position: 'absolute', 
                                top: '14px', 
                                left: '30px', 
                                right: '30px', 
                                height: '3px', 
                                backgroundColor: 'var(--gray-200)',
                                zIndex: 1
                              }}
                            >
                              <div 
                                style={{ 
                                  height: '100%', 
                                  backgroundColor: 'var(--primary)',
                                  width: currentStepIndex >= 0 ? `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` : '0%',
                                  transition: 'width 0.4s ease'
                                }}
                              />
                            </div>

                            {ORDER_STEPS.map((step, idx) => {
                              const isPassed = currentStepIndex >= idx;
                              return (
                                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                                  <div 
                                    style={{ 
                                      width: '30px', 
                                      height: '30px', 
                                      borderRadius: '50%', 
                                      backgroundColor: isPassed ? 'var(--primary)' : 'var(--gray-200)',
                                      color: isPassed ? '#ffffff' : 'var(--text-muted)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.8rem',
                                      fontWeight: 'bold',
                                      boxShadow: isPassed ? '0 0 0 4px var(--primary-bg)' : 'none'
                                    }}
                                  >
                                    {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                                  </div>
                                  <span style={{ fontSize: '0.78rem', marginTop: '6px', fontWeight: isPassed ? 700 : 500, color: isPassed ? 'var(--primary)' : 'var(--text-muted)' }}>
                                    {step}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
                          <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Items in this Order</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            {(order.items || []).map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--gray-50)', borderRadius: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <img 
                                    src={item.product?.imageUrl} 
                                    alt={item.product?.name} 
                                    style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} 
                                  />
                                  <div>
                                    <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{item.product?.name}</h5>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                      {item.quantity} x {formatINR(item.product?.price)} / {item.product?.unit}
                                    </span>
                                  </div>
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                  {formatINR(item.product?.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Delivery Address:</span>
                              <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{order.shippingAddress || 'Standard Local Delivery'}</p>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-muted)' }}>Estimated Delivery:</span>
                              <p style={{ margin: '4px 0 0', fontWeight: 600 }}>{formatDeliveryDate(order)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <Link to="/customer" className="btn btn-outline" style={{ display: 'inline-flex', gap: '6px' }}>
                    <span>Open Full Order Tracking Hub</span>
                    <ExternalLink size={15} />
                  </Link>
                </div>
              </div>
            )}
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
