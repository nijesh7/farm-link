import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowRight,
  Info,
  Scale,
  Sparkles,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function FarmProfitSimulator() {
  const [cropName, setCropName] = useState('Organic Strawberries');
  const [volume, setVolume] = useState(500); // in kg / lbs
  const [unit, setUnit] = useState('kg');

  // FarmLink Pricing
  const [farmLinkPrice, setFarmLinkPrice] = useState(240); // per unit
  const [productionCost, setProductionCost] = useState(90); // seed + compost + labour per unit
  const [packagingCost, setPackagingCost] = useState(12); // packaging per unit
  const [transportCost, setTransportCost] = useState(15); // transport per unit
  const commissionRate = 0.06; // 6%

  // Traditional Mandi Benchmark
  const [mandiPrice, setMandiPrice] = useState(165); // mandi wholesale price
  const [mandiCommissionRate, setMandiCommissionRate] = useState(0.12); // 12% middleman / broker cut
  const [mandiTransport, setMandiTransport] = useState(20); // travel to distant mandi

  // Calculations for FarmLink
  const grossFarmLink = volume * farmLinkPrice;
  const totalProduction = volume * productionCost;
  const totalPackaging = volume * packagingCost;
  const totalTransport = volume * transportCost;
  const totalCommissionFarmLink = grossFarmLink * commissionRate;
  const netIncomeFarmLink = grossFarmLink - totalProduction - totalPackaging - totalTransport - totalCommissionFarmLink;
  const marginFarmLinkPct = grossFarmLink > 0 ? ((netIncomeFarmLink / grossFarmLink) * 100).toFixed(1) : 0;

  // Calculations for Traditional Mandi
  const grossMandi = volume * mandiPrice;
  const totalMandiCommission = grossMandi * mandiCommissionRate;
  const totalMandiTransport = volume * mandiTransport;
  const netIncomeMandi = grossMandi - totalProduction - totalMandiTransport - totalMandiCommission;
  const marginMandiPct = grossMandi > 0 ? ((netIncomeMandi / grossMandi) * 100).toFixed(1) : 0;

  const profitDifference = netIncomeFarmLink - netIncomeMandi;
  const percentageIncrease = netIncomeMandi > 0 ? ((profitDifference / netIncomeMandi) * 100).toFixed(1) : 0;

  const handleResetDefaults = () => {
    setCropName('Organic Strawberries');
    setVolume(500);
    setFarmLinkPrice(240);
    setProductionCost(90);
    setPackagingCost(12);
    setTransportCost(15);
    setMandiPrice(165);
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: 'calc(100vh - 80px)', padding: '2.5rem 0' }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)',
          color: 'var(--white)',
          padding: '2.5rem',
          borderRadius: '16px',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#fff', marginBottom: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calculator size={16} /> Agricultural Financial Modeling
            </span>
            <h1 style={{ fontSize: '2.3rem', color: '#fff', marginBottom: '0.5rem' }}>Farm Profit & Margin Simulator</h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '700px', fontSize: '1rem', lineHeight: '1.6' }}>
              Transparently evaluate real net farm-gate earnings across Direct FarmLink sales versus traditional APMC wholesale intermediaries.
            </p>
          </div>

          <button className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff' }} onClick={handleResetDefaults}>
            <RotateCcw size={16} /> Reset Parameters
          </button>
        </div>

        {/* Simulator Workspace Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Inputs Section */}
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={20} color="var(--primary)" /> Crop & Cost Inputs
            </h2>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Crop / Produce Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Harvest Volume ({unit})</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    className="form-input"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                  />
                  <select
                    className="form-input"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ width: '80px' }}
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                    <option value="quintal">qt</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '1rem' }}>FarmLink Direct Sale Parameters:</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">FarmLink Selling Price (₹/{unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={farmLinkPrice}
                    onChange={(e) => setFarmLinkPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Production & Compost Cost (₹/{unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productionCost}
                    onChange={(e) => setProductionCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Packaging / Crate Cost (₹/{unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Local Hub Transport (₹/{unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={transportCost}
                    onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', color: '#e67e22', marginBottom: '1rem' }}>Traditional Mandi Wholesale Benchmark:</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Wholesale Mandi Auction Price (₹/{unit})</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mandiPrice}
                    onChange={(e) => setMandiPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Middleman Commission (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={mandiCommissionRate * 100}
                    onChange={(e) => setMandiCommissionRate((parseFloat(e.target.value) || 0) / 100)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Comparison Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Direct Side-by-Side Result */}
            <div className="card" style={{ padding: '2rem', border: '2px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Scale size={20} color="var(--primary)" /> Financial Comparison Summary
              </h3>

              {/* FarmLink Model */}
              <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid rgba(46, 204, 113, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>FarmLink Direct Sale:</span>
                  <span className="badge badge-success">Net Margin: {marginFarmLinkPct}%</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  {formatINR(netIncomeFarmLink)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Gross: {formatINR(grossFarmLink)} − Production: {formatINR(totalProduction)} − Packaging: {formatINR(totalPackaging)} − Transport: {formatINR(totalTransport)} − FarmLink Fee (6%): {formatINR(totalCommissionFarmLink)}
                </div>
              </div>

              {/* Traditional Mandi Model */}
              <div style={{ backgroundColor: 'var(--gray-100)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Traditional Mandi Intermediary:</span>
                  <span className="badge" style={{ backgroundColor: 'var(--gray-200)', color: 'var(--text-muted)' }}>Net Margin: {marginMandiPct}%</span>
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {formatINR(netIncomeMandi)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Gross: {formatINR(grossMandi)} − Production: {formatINR(totalProduction)} − Mandi Transport: {formatINR(totalMandiTransport)} − Commission ({mandiCommissionRate * 100}%): {formatINR(totalMandiCommission)}
                </div>
              </div>

              {/* Difference Delta */}
              <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Estimated Net Farmer Advantage:</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: profitDifference >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    {profitDifference >= 0 ? `+${formatINR(profitDifference)}` : formatINR(profitDifference)} ({percentageIncrease}% diff)
                  </div>
                </div>
                <Link to="/farmer" className="btn btn-primary btn-sm">
                  Apply to Catalog
                </Link>
              </div>
            </div>

            {/* Assumptions & Compliance Box */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--white)', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                <Info size={16} /> Transparent Simulator Assumptions:
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Calculations are modeled estimates based on current average transport tariffs, organic certification packaging benchmarks, and input costs entered above. Actual net income varies according to seasonal weather fluctuations, grade sorting, and final customer delivery radius.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
