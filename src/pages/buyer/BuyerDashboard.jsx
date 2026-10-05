import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Package,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  FileText,
  Truck,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import {
  getBulkRequirements,
  getBulkOffers,
  acceptBulkOffer,
  updateBulkRequirementStatus
} from '../../services/bulkMarketplaceService';
import { calculateFarmerTrustScore } from '../../services/analyticsService';

export default function BuyerDashboard() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [myRequirements, setMyRequirements] = useState([]);
  const [offersMap, setOffersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tenders'); // 'tenders', 'offers', 'orders'

  useEffect(() => {
    loadBuyerData();
  }, [currentUser]);

  const loadBuyerData = async () => {
    setLoading(true);
    try {
      const allReqs = await getBulkRequirements();
      // Filter for this buyer's requirements or show all for demo buyer
      const userReqs = allReqs.filter(
        (r) => r.buyerId === currentUser?.uid || currentUser?.role === 'buyer'
      );
      setMyRequirements(userReqs);

      const map = {};
      for (const req of userReqs) {
        const offers = await getBulkOffers(req.id);
        map[req.id] = offers;
      }
      setOffersMap(map);
    } catch (err) {
      console.error(err);
      showToast('Could not load buyer dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (reqId, offerId) => {
    try {
      await acceptBulkOffer(reqId, offerId, currentUser?.uid);
      showToast('Offer accepted! Split order initiated.', 'success');
      await loadBuyerData();
    } catch (err) {
      showToast('Failed to accept offer', 'error');
    }
  };

  const allReceivedOffers = Object.values(offersMap).flat();
  const acceptedOffers = allReceivedOffers.filter((o) => o.status === 'ACCEPTED');
  const totalProcuredValue = acceptedOffers.reduce(
    (sum, o) => sum + (o.offeredQuantity * o.offeredPrice),
    0
  );

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Buyer Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Building2 size={14} /> Commercial B2B Buyer Operations
            </span>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.25rem' }}>
              {currentUser?.name || 'Bulk Procurement Hub'}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage agricultural purchase tenders, inspect farmer quotes, verify grower trust, and track multi-farm fulfillment.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/bulk-marketplace" className="btn btn-primary btn-sm">
              <Plus size={16} /> Post New Requirement
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'var(--primary-bg)', padding: '0.85rem', borderRadius: '12px' }}>
              <FileText size={24} color="var(--primary)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Tenders</span>
              <h3 style={{ fontSize: '1.6rem' }}>{myRequirements.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(52, 152, 219, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <Clock size={24} color="var(--info)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Farmer Offers Received</span>
              <h3 style={{ fontSize: '1.6rem' }}>{allReceivedOffers.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <CheckCircle2 size={24} color="var(--success)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accepted Lots</span>
              <h3 style={{ fontSize: '1.6rem' }}>{acceptedOffers.length}</h3>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.12)', padding: '0.85rem', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--warning)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contracted Volume Value</span>
              <h3 style={{ fontSize: '1.6rem' }}>{formatINR(totalProcuredValue || 27500)}</h3>
            </div>
          </div>
        </div>

        {/* Tenders & Offers Management */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>My Open Procurement Requirements</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading requirements...</p>
            </div>
          ) : myRequirements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Package size={40} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-muted)' }}>You haven't posted any bulk requirements yet.</p>
              <Link to="/bulk-marketplace" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                Create First Bulk Tender
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myRequirements.map((req) => {
                const offers = offersMap[req.id] || [];
                const fulfilledQty = offers
                  .filter((o) => o.status === 'ACCEPTED')
                  .reduce((sum, o) => sum + (o.offeredQuantity || 0), 0);

                return (
                  <div key={req.id} style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1.5rem', backgroundColor: 'var(--white)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <span className="badge badge-primary">{req.status}</span>
                          <span className="badge" style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text-muted)' }}>
                            {req.category}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{req.product}</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Required: <strong>{req.requiredQuantity} {req.unit}</strong> at max <strong>{formatINR(req.maxBudgetPerUnit)}/{req.unit}</strong> • Target: {req.requiredDate}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fulfilled</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>
                          {fulfilledQty} / {req.requiredQuantity} {req.unit}
                        </div>
                      </div>
                    </div>

                    {/* Offers Comparison Table */}
                    <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                        Farmer Quotes & Proposals ({offers.length}):
                      </h4>

                      {offers.length === 0 ? (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          Awaiting responses from regional verified growers.
                        </p>
                      ) : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                            <thead>
                              <tr style={{ backgroundColor: 'var(--gray-100)', textAlign: 'left' }}>
                                <th style={{ padding: '0.75rem 1rem' }}>Farmer / Orchard</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Offered Qty</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Price / Unit</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Total Lot</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Trust Score</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {offers.map((offer) => {
                                const trust = calculateFarmerTrustScore(offer.farmerId, [], []);
                                return (
                                  <tr key={offer.id} style={{ borderBottom: '1px solid var(--gray-200)' }}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{offer.farmerName}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{offer.farmLocation}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{offer.offeredQuantity} {offer.unit}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--primary)', fontWeight: 700 }}>
                                      {formatINR(offer.offeredPrice)}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                                      {formatINR(offer.offeredQuantity * offer.offeredPrice)}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                      <span className="badge" style={{ backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#d35400', fontWeight: 700 }}>
                                        {trust.hasSufficientData ? `${trust.score}/100 ⭐` : 'Verified ⭐'}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                      <span className={`badge ${offer.status === 'ACCEPTED' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.75rem' }}>
                                        {offer.status}
                                      </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                      {offer.status === 'ACCEPTED' ? (
                                        <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.8rem' }}>✓ Contracted</span>
                                      ) : (
                                        <button
                                          className="btn btn-primary btn-sm"
                                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                                          onClick={() => handleAcceptOffer(req.id, offer.id)}
                                        >
                                          Accept Lot
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
