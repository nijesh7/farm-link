import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, MapPin, Package, Phone, RefreshCw, ShoppingBag, User } from 'lucide-react';
import { getFarmerOrders, updateOrderStatus } from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';

const STATUS_OPTIONS = ['Pending', 'In Transit', 'Delivered', 'Cancelled'];

const statusClass = (status) => {
  if (status === 'Delivered') return 'badge-success';
  if (status === 'Cancelled') return 'badge-danger';
  return 'badge-warning';
};

export default function FarmerOrders() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!currentUser?.uid) return;
    setIsLoading(true);
    try {
      setOrders(await getFarmerOrders(currentUser.uid));
    } catch (error) {
      console.error(error);
      showToast('Could not load customer orders.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, showToast]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const orderSummaries = useMemo(() => orders.map((order) => {
    const items = (order.items || []).filter((item) => item.product?.farmerId === currentUser?.uid);
    const subtotal = items.reduce((total, item) => total + (Number(item.product?.price) || 0) * (Number(item.quantity) || 0), 0);
    return { ...order, farmerItems: items, farmerSubtotal: subtotal };
  }), [orders, currentUser?.uid]);

  const handleStatusChange = async (orderId, status) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((currentOrders) => currentOrders.map((order) => (
        order.id === orderId ? { ...order, status } : order
      )));
      showToast(`Order marked as ${status}.`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not update the order status.', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container" style={{ maxWidth: '1050px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.3rem' }}>Customer Orders</h1>
            <p style={{ color: 'var(--text-muted)' }}>See the crops customers ordered from you and keep each order updated.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={loadOrders} disabled={isLoading}>
              <RefreshCw size={16} /> Refresh
            </button>
            <Link to="/farmer" className="btn btn-primary btn-sm">Back to dashboard</Link>
          </div>
        </div>

        {isLoading ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orderSummaries.length === 0 ? (
          <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <ShoppingBag size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
            <h3>No customer orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem' }}>Orders containing your crops will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orderSummaries.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Just now';
              return (
                <article key={order.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem' }}>ORDER #{order.id}</span>
                      <strong>{order.customerName || 'Customer'}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> · Ordered {orderDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${statusClass(order.status)}`}>{order.status}</span>
                      <select
                        aria-label={`Update status for order ${order.id}`}
                        value={order.status}
                        disabled={updatingOrderId === order.id}
                        onChange={(event) => handleStatusChange(order.id, event.target.value)}
                        style={{ padding: '0.42rem 0.6rem', borderRadius: '6px', border: '1px solid var(--gray-300)', background: 'var(--white)' }}
                      >
                        {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ margin: '1.15rem 0', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '10px' }}>
                    {order.farmerItems.map((item, index) => (
                      <div key={`${item.product?.id || item.product?.name}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: index ? '0.7rem 0 0' : 0, marginTop: index ? '0.7rem' : 0, borderTop: index ? '1px solid var(--gray-200)' : 'none' }}>
                        <span><Package size={15} style={{ verticalAlign: '-2px', marginRight: '0.35rem', color: 'var(--primary)' }} /><strong>{item.product?.name}</strong> <span style={{ color: 'var(--text-muted)' }}>× {item.quantity} {item.product?.unit}</span></span>
                        <strong>{formatINR((Number(item.product?.price) || 0) * (Number(item.quantity) || 0))}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} aria-expanded={isExpanded}>
                      {isExpanded ? 'Hide customer details' : 'View customer details'} <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : undefined }} />
                    </button>
                    <div><span style={{ color: 'var(--text-muted)' }}>Your order total: </span><strong style={{ color: 'var(--primary)', fontSize: '1.08rem' }}>{formatINR(order.farmerSubtotal)}</strong></div>
                  </div>

                  {isExpanded && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
                      <div><User size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} /><strong>{order.customerName || 'Not provided'}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>Customer name</span></div>
                      <div><Phone size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} /><strong>{order.phone || 'Not provided'}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>Phone number</span></div>
                      <div><MapPin size={16} style={{ verticalAlign: '-3px', marginRight: '0.35rem' }} /><strong>{order.deliveryAddress || 'Not provided'}</strong><span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.25rem' }}>Delivery address</span></div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
