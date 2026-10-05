import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Package,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import {
  getBulkRequirements,
  createBulkRequirement,
  getBulkOffers,
  submitBulkOffer,
  acceptBulkOffer
} from '../services/bulkMarketplaceService';
import { calculateFarmerTrustScore } from '../services/analyticsService';

const BUYER_TYPES = [
  'Restaurant / Cafe',
  'Hotel / Hospitality',
  'Hostel / Canteen',
  'Caterer & Banquet',
  'Grocery Retail Chain',
  'Institutional Kitchen',
  'Food Processing Unit'
];

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains', 'Pulses', 'Leafy Greens', 'Dairy'];

export default function BulkMarketplace() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [requirements, setRequirements] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [offersMap, setOffersMap] = useState({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // New Requirement Form
  const [reqForm, setReqForm] = useState({
    buyerType: 'Restaurant / Cafe',
    product: '',
    category: 'Vegetables',
    requiredQuantity: '',
    unit: 'kg',
    maxBudgetPerUnit: '',
    requiredDate: '',
    deliveryLocation: currentUser?.address || '',
    qualityRequirements: '',
    additionalNotes: ''
  });

  // Farmer Offer Form
  const [offerForm, setOfferForm] = useState({
    farmName: 'Heritage Farm Orchards',
    offeredQuantity: '',
    unit: 'kg',
    offeredPrice: '',
    deliveryDate: '',
    farmLocation: currentUser?.address || '',
    additionalMessage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBulkRequirements();
      setRequirements(data);

      // Load offers for all requirements
      const map = {};
      for (const req of data) {
        const offers = await getBulkOffers(req.id);
        map[req.id] = offers;
      }
      setOffersMap(map);
    } catch (err) {
      console.error(err);
      showToast('Could not load bulk requirements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!reqForm.product || !reqForm.requiredQuantity || !reqForm.maxBudgetPerUnit || !reqForm.requiredDate || !reqForm.deliveryLocation) {
      showToast('Please fill all mandatory fields', 'error');
      return;
    }

    try {
      await createBulkRequirement(reqForm, currentUser || { uid: 'anon_buyer', name: 'Commercial Bulk Buyer' });
      showToast('Bulk requirement published successfully!', 'success');
      setShowCreateModal(false);
      setReqForm({
        buyerType: 'Restaurant / Cafe',
        product: '',
        category: 'Vegetables',
        requiredQuantity: '',
        unit: 'kg',
        maxBudgetPerUnit: '',
        requiredDate: '',
        deliveryLocation: '',
        qualityRequirements: '',
        additionalNotes: ''
      });
      await loadData();
    } catch (err) {
      showToast('Failed to create requirement', 'error');
    }
  };

  const handleOpenOfferModal = (req) => {
    setSelectedReq(req);
    setOfferForm({
      farmName: 'Heritage Farm Orchards',
      offeredQuantity: req.requiredQuantity,
      unit: req.unit,
      offeredPrice: req.maxBudgetPerUnit,
      deliveryDate: req.requiredDate,
      farmLocation: currentUser?.address || 'Local Region',
      additionalMessage: ''
    });
    setShowOfferModal(true);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.offeredQuantity || !offerForm.offeredPrice || !offerForm.deliveryDate) {
      showToast('Please enter quantity, price, and delivery date', 'error');
      return;
    }

    try {
      await submitBulkOffer(
        selectedReq.id,
        offerForm,
        currentUser || { uid: 'demo_farmer_001', name: 'Farmer John Doe' }
      );
      showToast('Offer submitted to bulk buyer successfully!', 'success');
      setShowOfferModal(false);
      await loadData();
    } catch (err) {
      showToast('Could not submit offer', 'error');
    }
  };

  const handleAcceptOffer = async (reqId, offerId) => {
    try {
      await acceptBulkOffer(reqId, offerId, currentUser?.uid);
      showToast('Farmer offer accepted! Order moved to fulfillment stage.', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to accept offer', 'error');
    }
  };

  const filteredRequirements = requirements.filter((req) => {
    const matchesSearch =
      req.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.deliveryLocation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || req.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'POSTED':
        return 'badge-primary';
      case 'OFFERS RECEIVED':
      case 'NEGOTIATING':
        return 'badge-warning';
      case 'PARTIALLY FULFILLED':
      case 'ACCEPTED':
        return 'badge-info';
      case 'FULFILLED':
        return 'badge-success';
      case 'CANCELLED':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #1b4332 100%)',
          color: 'var(--white)',
          padding: '2.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ maxWidth: '680px' }}>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Building2 size={16} /> Direct B2B Wholesale & Commercial Gateway
            </span>
            <h1 style={{ fontSize: '2.3rem', color: '#fff', marginBottom: '0.5rem' }}>B2B Bulk Agricultural Marketplace</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', lineHeight: '1.6' }}>
              Connecting verified farmers directly with restaurants, hotels, caterers, canteens, and institutions. High-volume procurement with partial fulfillment support and zero middlemen markup.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#fff', color: 'var(--primary)', fontWeight: 700, padding: '0.85rem 1.5rem' }}
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={18} />
              <span>Post Buyer Requirement</span>
            </button>
            {currentUser?.role === 'buyer' && (
              <Link to="/buyer" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
                My Buyer Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by product, buyer name, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: 'auto', minWidth: '150px' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>

              <select
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ width: 'auto', minWidth: '160px' }}
              >
                <option value="All">All Statuses</option>
                <option value="POSTED">POSTED</option>
                <option value="OFFERS RECEIVED">OFFERS RECEIVED</option>
                <option value="NEGOTIATING">NEGOTIATING</option>
                <option value="PARTIALLY FULFILLED">PARTIALLY FULFILLED</option>
                <option value="FULFILLED">FULFILLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requirements Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Loading active commercial requirements...</p>
          </div>
        ) : filteredRequirements.length === 0 ? (
          <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Building2 size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Bulk Requirements Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              No commercial procurement tenders match your search criteria.
            </p>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create First Requirement
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {filteredRequirements.map((req) => {
              const reqOffers = offersMap[req.id] || [];
              const acceptedOffers = reqOffers.filter((o) => o.status === 'ACCEPTED');
              const acceptedQty = acceptedOffers.reduce((sum, o) => sum + (o.offeredQuantity || 0), 0);
              const progressPct = Math.min(100, Math.round((acceptedQty / req.requiredQuantity) * 100));

              return (
                <div key={req.id} className="card" style={{ padding: '1.75rem', transition: 'transform 0.2s', border: '1px solid var(--gray-200)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                        <span className={`badge ${getStatusBadgeClass(req.status)}`}>{req.status}</span>
                        <span className="badge" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: 'var(--info)' }}>
                          {req.buyerType}
                        </span>
                        <span className="badge" style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: 'var(--primary)' }}>
                          {req.category}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {req.product}
                      </h2>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Building2 size={15} /> <strong>{req.buyerName}</strong>
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <MapPin size={15} /> {req.deliveryLocation}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={15} /> Needed By: <strong>{new Date(req.requiredDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Volume & Budget</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {req.requiredQuantity} {req.unit}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        Max {formatINR(req.maxBudgetPerUnit)} / {req.unit}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Total Value: ~{formatINR(req.requiredQuantity * req.maxBudgetPerUnit)}
                      </div>
                    </div>
                  </div>

                  {/* Quality & Specs */}
                  <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.85rem 1.2rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>
                      <strong>Quality Standard:</strong> <span style={{ color: 'var(--text-main)' }}>{req.qualityRequirements}</span>
                    </div>
                    {req.additionalNotes && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        <strong>Notes:</strong> {req.additionalNotes}
                      </div>
                    )}
                  </div>

                  {/* Partial Fulfilment Progress */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600 }}>
                        Fulfilment Progress: {acceptedQty} / {req.requiredQuantity} {req.unit} ({progressPct}%)
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {reqOffers.length} farmer offer{reqOffers.length === 1 ? '' : 's'} submitted
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--gray-200)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPct}%`, height: '100%', backgroundColor: progressPct >= 100 ? 'var(--success)' : 'var(--primary)', transition: 'width 0.3s' }}></div>
                    </div>
                  </div>

                  {/* Submitted Farmer Offers (Collapsible or Preview) */}
                  {reqOffers.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', marginTop: '1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>Farmer Responses & Partial Lots:</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                        {reqOffers.map((offer) => {
                          const trust = calculateFarmerTrustScore(offer.farmerId, [], []);
                          return (
                            <div key={offer.id} style={{
                              border: '1px solid var(--gray-200)',
                              borderRadius: '10px',
                              padding: '0.85rem',
                              backgroundColor: offer.status === 'ACCEPTED' ? 'rgba(46, 204, 113, 0.05)' : 'var(--white)',
                              position: 'relative'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{offer.farmerName}</div>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{offer.farmLocation}</div>
                                </div>
                                <span className={`badge ${offer.status === 'ACCEPTED' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.7rem' }}>
                                  {offer.status}
                                </span>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', margin: '0.5rem 0', fontWeight: 600 }}>
                                <span>Offered: {offer.offeredQuantity} {offer.unit}</span>
                                <span style={{ color: 'var(--primary)' }}>{formatINR(offer.offeredPrice)} / {offer.unit}</span>
                              </div>

                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                                Delivery: {offer.deliveryDate} • Trust Score: <strong style={{ color: 'var(--primary)' }}>{trust.hasSufficientData ? `${trust.score}/100 ⭐` : 'Verified Grower'}</strong>
                              </div>

                              {offer.additionalMessage && (
                                <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
                                  "{offer.additionalMessage}"
                                </div>
                              )}

                              {/* Accept button for Buyer / Admin */}
                              {(currentUser?.role === 'buyer' || currentUser?.role === 'admin') && offer.status !== 'ACCEPTED' && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                                  onClick={() => handleAcceptOffer(req.id, offer.id)}
                                >
                                  Accept This Partial Lot ({offer.offeredQuantity} {offer.unit})
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Farmer Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleOpenOfferModal(req)}
                      disabled={req.status === 'FULFILLED' || req.status === 'CANCELLED'}
                    >
                      <Send size={16} />
                      <span>{req.status === 'FULFILLED' ? 'Requirement Fulfilled' : 'Submit Farmer Offer / Split Lot'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE REQUIREMENT MODAL */}
      {showCreateModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={22} color="var(--primary)" /> Create Bulk Buyer Requirement
              </h2>
              <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateRequirement}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Buyer Type</label>
                  <select
                    className="form-input"
                    value={reqForm.buyerType}
                    onChange={(e) => setReqForm({ ...reqForm, buyerType: e.target.value })}
                  >
                    {BUYER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-input"
                    value={reqForm.category}
                    onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name / Variety *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Heirloom Organic Tomatoes (Grade A)"
                  value={reqForm.product}
                  onChange={(e) => setReqForm({ ...reqForm, product: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Required Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 500"
                    value={reqForm.requiredQuantity}
                    onChange={(e) => setReqForm({ ...reqForm, requiredQuantity: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select
                    className="form-input"
                    value={reqForm.unit}
                    onChange={(e) => setReqForm({ ...reqForm, unit: e.target.value })}
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="quintal">quintal (100 kg)</option>
                    <option value="crate">crates (20 kg)</option>
                    <option value="ton">ton (1,000 kg)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Max Budget Per Unit (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 38"
                    value={reqForm.maxBudgetPerUnit}
                    onChange={(e) => setReqForm({ ...reqForm, maxBudgetPerUnit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Required By Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={reqForm.requiredDate}
                    onChange={(e) => setReqForm({ ...reqForm, requiredDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Location / Central Kitchen Address *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Madurai Central Kitchen, Ring Road, Tamil Nadu"
                  value={reqForm.deliveryLocation}
                  onChange={(e) => setReqForm({ ...reqForm, deliveryLocation: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quality & Grade Requirements</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Grade-A firm skin, zero pesticide residue, minimum 60mm diameter..."
                  value={reqForm.qualityRequirements}
                  onChange={(e) => setReqForm({ ...reqForm, qualityRequirements: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Payment / Schedule Notes</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="e.g. Partial fulfillment acceptable from multiple verified growers..."
                  value={reqForm.additionalNotes}
                  onChange={(e) => setReqForm({ ...reqForm, additionalNotes: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Tender Requirement</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT FARMER OFFER MODAL */}
      {showOfferModal && selectedReq && (
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
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-200)', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem' }}>Submit Farmer Offer / Split Lot</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Responding to <strong>{selectedReq.buyerName}</strong> for {selectedReq.product}
                </p>
              </div>
              <button className="btn" style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setShowOfferModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitOffer}>
              <div style={{ backgroundColor: 'var(--gray-100)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div><strong>Buyer Max Budget:</strong> {formatINR(selectedReq.maxBudgetPerUnit)} / {selectedReq.unit}</div>
                <div><strong>Total Quantity Needed:</strong> {selectedReq.requiredQuantity} {selectedReq.unit}</div>
                <div><strong>Delivery Target:</strong> {selectedReq.requiredDate} at {selectedReq.deliveryLocation}</div>
              </div>

              <div className="form-group">
                <label className="form-label">Farm / Orchard Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={offerForm.farmName}
                  onChange={(e) => setOfferForm({ ...offerForm, farmName: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity You Can Supply ({selectedReq.unit}) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder={`Max ${selectedReq.requiredQuantity}`}
                    value={offerForm.offeredQuantity}
                    onChange={(e) => setOfferForm({ ...offerForm, offeredQuantity: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partial lots are welcomed</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Offered Price Per {selectedReq.unit} (₹) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 36"
                    value={offerForm.offeredPrice}
                    onChange={(e) => setOfferForm({ ...offerForm, offeredPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Confirmed Dispatch Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={offerForm.deliveryDate}
                    onChange={(e) => setOfferForm({ ...offerForm, deliveryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Farm Origin Location</label>
                  <input
                    type="text"
                    className="form-input"
                    value={offerForm.farmLocation}
                    onChange={(e) => setOfferForm({ ...offerForm, farmLocation: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Quality Assurance to Buyer</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Mention harvest timing, cold-chain transport arrangement, organic certification..."
                  value={offerForm.additionalMessage}
                  onChange={(e) => setOfferForm({ ...offerForm, additionalMessage: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowOfferModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Commercial Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
