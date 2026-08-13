import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getFarmerProducts,
  getFarmerOrders,
  saveProduct,
  deleteProduct,
  updateOrderStatus,
} from '../../services/firebaseDb';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Check, DollarSign, Package, ShoppingBag, Search } from 'lucide-react';
import { getCategoryImage } from '../../data/categoryImages';
import { formatINR } from '../../utils/currency';

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Dairy', 'Organic Products'];

export default function FarmerDashboard() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesSum, setSalesSum] = useState(0);
  const [catalogSearch, setCatalogSearch] = useState('');

  // Form Mode: 'list', 'add', 'edit'
  const [viewMode, setViewMode] = useState('list');
  const [formState, setFormState] = useState({
    id: '',
    name: '',
    description: '',
    category: 'Vegetables',
    price: '',
    unit: 'lb',
    quantity: '',
  });

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Load farmer items
  useEffect(() => {
    if (currentUser) {
      void loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser?.uid) return;

    try {
      const [farmerProducts, farmerOrders] = await Promise.all([
        getFarmerProducts(currentUser.uid),
        getFarmerOrders(currentUser.uid),
      ]);

      setProducts(farmerProducts);
      setOrders(farmerOrders);

      const sales = farmerOrders.reduce((sum, order) => {
        const farmerItemsTotal = (order.items || [])
          .filter((item) => item.product?.farmerId === currentUser.uid)
          .reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        return sum + farmerItemsTotal;
      }, 0);
      setSalesSum(sales);
    } catch (err) {
      console.error(err);
      showToast('Could not load farmer dashboard data.', 'error');
    }
  };

  const handleInputChange = (e) => {
    setFormState({ ...formState, [e.target.id]: e.target.value });
  };

  const handleOpenAdd = () => {
    setFormState({
      id: '',
      name: '',
      description: '',
      category: 'Vegetables',
      price: '',
      unit: 'lb',
      quantity: '',
    });
    setViewMode('add');
  };

  const handleOpenEdit = (product) => {
    setFormState({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      unit: product.unit,
      quantity: product.quantity,
    });
    setViewMode('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.price || !formState.quantity || !formState.unit) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    try {
      await saveProduct(formState, currentUser);
      showToast(formState.id ? 'Product updated successfully!' : 'Product added successfully!', 'success');
      setViewMode('list');
      await loadData();
    } catch (err) {
      showToast('Failed to save product.', 'error');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteProduct(deleteConfirmId, currentUser.uid);
      showToast('Product deleted successfully.', 'info');
      setDeleteConfirmId(null);
      await loadData();
    } catch (err) {
      showToast('Could not delete product.', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to: ${newStatus}`, 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const activeProductsCount = products.filter((p) => p.quantity > 0).length;
  const visibleProducts = products.filter((product) => {
    const query = catalogSearch.trim().toLowerCase();
    return !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
  });

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Welcome Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Farmer Portal</h1>
            <p style={{ color: 'var(--text-muted)' }}>Welcome back, {currentUser?.name}. Manage listings and orders.</p>
          </div>
          <span className="badge" style={{ backgroundColor: 'rgba(212, 163, 115, 0.15)', color: 'var(--secondary)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Account Role: Farmer Partner
          </span>
          <Link to="/farmer/orders" className="btn btn-primary btn-sm">View Customer Orders</Link>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.8rem', borderRadius: '12px' }}>
              <Package size={24} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Listings</span>
              <h3 style={{ fontSize: '1.5rem' }}>{products.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', padding: '0.8rem', borderRadius: '12px' }}>
              <Check size={24} color="var(--success)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Items</span>
              <h3 style={{ fontSize: '1.5rem' }}>{activeProductsCount}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', padding: '0.8rem', borderRadius: '12px' }}>
              <ShoppingBag size={24} color="var(--warning)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders Received</span>
              <h3 style={{ fontSize: '1.5rem' }}>{orders.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(34, 152, 219, 0.12)', padding: '0.8rem', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--info)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>My Gross Sales</span>
              <h3 style={{ fontSize: '1.5rem' }}>{formatINR(salesSum)}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs & Workspaces */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }}>
          
          {/* Product Management Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>My Crop Catalog</h2>
              {viewMode === 'list' ? (
                <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                  <Plus size={16} />
                  <span>Add New Crop</span>
                </button>
              ) : (
                <button className="btn btn-outline btn-sm" onClick={() => setViewMode('list')}>
                  Back to Catalog
                </button>
              )}
            </div>

            {viewMode === 'list' && products.length > 0 && (
              <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="search"
                  className="form-input"
                  placeholder="Search crops or categories..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            )}

            {/* View Catalog Lists */}
            {viewMode === 'list' && (
              products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                  <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                  <h4>No Crops Registered</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Get started by putting your harvest online.</p>
                  <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
                    Add First Crop
                  </button>
                </div>
              ) : visibleProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1.5rem', color: 'var(--text-muted)' }}>
                  No listings match “{catalogSearch}”.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--gray-100)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Quantity / Unit</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textalign: 'right', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', fontSize: '0.95rem' }}>
                          <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img src={p.imageUrl} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                            <strong style={{ color: 'var(--gray-800)' }}>{p.name}</strong>
                          </td>
                          <td style={{ padding: '1rem' }}>{p.category}</td>
                          <td style={{ padding: '1rem', fontWeight: 600 }}>{formatINR(p.price)}</td>
                          <td style={{ padding: '1rem' }}>{p.quantity} {p.unit}s</td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${p.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                              {p.quantity > 0 ? 'Available' : 'Out of Stock'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button className="btn btn-outline btn-sm" style={{ padding: '0.4rem' }} onClick={() => handleOpenEdit(p)} title="Edit product">
                                <Edit2 size={14} />
                              </button>
                              <button className="btn btn-outline btn-sm" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(217,83,79,0.2)' }} onClick={() => handleDeleteClick(p.id)} title="Delete crop listing">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Add / Edit Form */}
            {(viewMode === 'add' || viewMode === 'edit') && (
              <form onSubmit={handleFormSubmit} style={{ maxWidth: '700px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Product/Crop Name *</label>
                  <input type="text" id="name" className="form-input" placeholder="e.g. Heirloom Gala Apples" value={formState.name} onChange={handleInputChange} required />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description *</label>
                  <textarea id="description" className="form-input" rows="3" placeholder="Provide details about fresh organic quality, harvest details..." value={formState.description} onChange={handleInputChange} required></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category *</label>
                    <select id="category" className="form-input" value={formState.category} onChange={handleInputChange} required>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                  <span className="form-label">Listing image preview</span>
                  <img
                    src={getCategoryImage(formState.category)}
                    alt={`${formState.category} default`}
                    style={{ display: 'block', width: '100%', maxWidth: '280px', height: '150px', objectFit: 'cover', borderRadius: '10px', border: '1px solid var(--gray-200)' }}
                  />
                  <small style={{ color: 'var(--text-muted)' }}>A category image is added automatically when you save this listing.</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="price">Price (₹) *</label>
                    <input type="number" step="0.01" id="price" className="form-input" placeholder="4.99" value={formState.price} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="unit">Selling Unit *</label>
                    <input type="text" id="unit" className="form-input" placeholder="e.g. lb, bunch, dozen, kg" value={formState.unit} onChange={handleInputChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="quantity">Available Quantity (Stock) *</label>
                    <input type="number" id="quantity" className="form-input" placeholder="25" value={formState.quantity} onChange={handleInputChange} required />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: 'var(--primary)', borderColor: 'var(--primary)' }}>
                    <span>{viewMode === 'edit' ? 'Update Crop' : 'List Crop'}</span>
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setViewMode('list')}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Farmer Orders Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1rem' }}>Incoming Orders</h2>
            
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <ShoppingBag size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h4>No Incoming Orders</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Customer orders will show up here as soon as they purchase your crop products.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {orders.map((order) => {
                  // Only show items belonging to this farmer
                  const farmerItems = order.items.filter((i) => i.product.farmerId === currentUser.uid);
                  const farmerSubtotal = farmerItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

                  return (
                    <div key={order.id} className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--gray-50)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID: </span>
                          <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{order.id}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Update Status:</span>
                          <select 
                            style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--gray-300)', fontSize: '0.85rem', cursor: 'pointer' }}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="farmer-order-subgrid">
                        <div>
                          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Items Ordered:</h4>
                          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {farmerItems.map((item, idx) => (
                              <li key={idx} style={{ fontSize: '0.9rem', color: 'var(--gray-800)' }}>
                                🥕 <strong>{item.product.name}</strong> - {item.quantity} x {item.product.unit}s ({formatINR(item.product.price * item.quantity)})
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Customer Details:</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-800)', margin: '0.1rem 0' }}>
                            Name: <strong>{order.customerName}</strong>
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-800)', margin: '0.1rem 0' }}>
                            Phone: <strong>{order.phone}</strong>
                          </p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--gray-800)', margin: '0.1rem 0' }}>
                            Address: <strong>{order.deliveryAddress}</strong>
                          </p>
                        </div>
                      </div>

                      <div style={{ borderTop: '1px solid var(--gray-200)', marginTop: '1rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Ordered on: {new Date(order.createdAt).toLocaleDateString()}</span>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Farmer Revenue: </span>
                          <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatINR(farmerSubtotal)}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
        >
          <div className="card" style={{ maxWidth: '420px', padding: '2rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>Remove Crop Listing?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Use this when a crop has sold out or is no longer available. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleConfirmDelete}>
                Confirm Delete
              </button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .farmer-order-subgrid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
