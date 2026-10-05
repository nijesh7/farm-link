import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle,
  Calculator,
  Bell
} from 'lucide-react';
import { formatINR } from '../utils/currency';
import { useToast } from '../context/ToastContext';

const COMMODITY_TRENDS = [
  {
    id: 'strawberries',
    name: 'Organic Strawberries',
    category: 'Fruits',
    unit: 'lb',
    farmLinkPrice: 249,
    mandiWholesale: 175,
    retailSupermarket: 340,
    change24h: +4.2,
    trend: 'up',
    stability: 'High',
    demandScore: 94,
    history7d: [220, 228, 235, 240, 238, 245, 249],
    history30d: [195, 205, 210, 215, 220, 230, 240, 245, 249],
    harvestPeak: 'Jan - Apr',
    optimalSellingPrice: 250
  },
  {
    id: 'tomatoes',
    name: 'Heirloom Tomatoes',
    category: 'Vegetables',
    unit: 'lb',
    farmLinkPrice: 99,
    mandiWholesale: 60,
    retailSupermarket: 145,
    change24h: -1.8,
    trend: 'down',
    stability: 'Medium',
    demandScore: 88,
    history7d: [110, 108, 105, 102, 100, 98, 99],
    history30d: [120, 115, 112, 108, 105, 102, 100, 97, 99],
    harvestPeak: 'All Season',
    optimalSellingPrice: 105
  },
  {
    id: 'spinach',
    name: 'Crisp Baby Spinach',
    category: 'Leafy Greens',
    unit: 'bunch',
    farmLinkPrice: 79,
    mandiWholesale: 42,
    retailSupermarket: 110,
    change24h: +2.5,
    trend: 'up',
    stability: 'High',
    demandScore: 91,
    history7d: [72, 74, 75, 76, 75, 78, 79],
    history30d: [68, 70, 72, 73, 75, 76, 77, 78, 79],
    harvestPeak: 'Oct - Mar',
    optimalSellingPrice: 80
  },
  {
    id: 'wheat',
    name: 'Heirloom Stoneground Wheat',
    category: 'Grains',
    unit: '5lb bag',
    farmLinkPrice: 399,
    mandiWholesale: 280,
    retailSupermarket: 540,
    change24h: +0.8,
    trend: 'up',
    stability: 'Very High',
    demandScore: 86,
    history7d: [390, 392, 395, 395, 398, 398, 399],
    history30d: [380, 385, 388, 390, 392, 395, 397, 398, 399],
    harvestPeak: 'Mar - Jun',
    optimalSellingPrice: 410
  },
  {
    id: 'eggs',
    name: 'Pasture-Raised Organic Eggs',
    category: 'Dairy',
    unit: 'dozen',
    farmLinkPrice: 219,
    mandiWholesale: 150,
    retailSupermarket: 290,
    change24h: +1.2,
    trend: 'up',
    stability: 'High',
    demandScore: 96,
    history7d: [210, 212, 215, 215, 218, 218, 219],
    history30d: [200, 205, 208, 210, 212, 215, 216, 218, 219],
    harvestPeak: 'All Year',
    optimalSellingPrice: 225
  },
  {
    id: 'kidney_beans',
    name: 'Organic Red Kidney Beans',
    category: 'Pulses',
    unit: 'lb',
    farmLinkPrice: 149,
    mandiWholesale: 95,
    retailSupermarket: 210,
    change24h: -0.5,
    trend: 'down',
    stability: 'Medium',
    demandScore: 82,
    history7d: [152, 150, 150, 148, 149, 148, 149],
    history30d: [160, 158, 155, 152, 150, 150, 148, 149, 149],
    harvestPeak: 'Nov - Feb',
    optimalSellingPrice: 155
  }
];

export default function MarketTrends() {
  const { showToast } = useToast();
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITY_TRENDS[0]);
  const [timeRange, setTimeRange] = useState('7d');
  
  // Margin Calculator State
  const [calcQuantity, setCalcQuantity] = useState(100);
  const [calcBasePrice, setCalcBasePrice] = useState(150);

  const historyData =
    timeRange === '7d' ? selectedCommodity.history7d : selectedCommodity.history30d;

  // Compute SVG chart coordinates
  const minPrice = Math.min(...historyData) * 0.95;
  const maxPrice = Math.max(...historyData) * 1.05;
  const chartHeight = 200;
  const chartWidth = 500;

  const points = historyData
    .map((val, idx) => {
      const x = (idx / (historyData.length - 1)) * (chartWidth - 60) + 30;
      const y = chartHeight - 30 - ((val - minPrice) / (maxPrice - minPrice)) * (chartHeight - 60);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${points} ${chartWidth - 30},${chartHeight - 30} 30,${chartHeight - 30}`;

  // Calculator calculations
  const mandiRevenue = calcQuantity * calcBasePrice;
  const farmLinkDirectPrice = Math.round(calcBasePrice * 1.45);
  const farmLinkRevenue = calcQuantity * farmLinkDirectPrice;
  const extraEarnings = farmLinkRevenue - mandiRevenue;
  const percentageGain = Math.round((extraEarnings / mandiRevenue) * 100);

  const handleSubscribeAlert = () => {
    showToast(`Price alerts enabled for ${selectedCommodity.name}! You will be notified of 5%+ price swings.`, 'success');
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={13} /> Real-Time Agri-Intelligence
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Updated 15 mins ago
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800 }}>Mandi vs Direct Market Price Index</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Track live commodity prices, transparent margin breakdowns, and harvest forecasting.
            </p>
          </div>

          <button 
            className="btn btn-primary"
            onClick={handleSubscribeAlert}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Bell size={18} />
            <span>Set Price Alert</span>
          </button>
        </div>

        {/* Live Ticker Cards */}
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '1rem', 
            marginBottom: '2.5rem' 
          }}
        >
          {COMMODITY_TRENDS.map((item) => {
            const isSelected = selectedCommodity.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedCommodity(item)}
                className="card"
                style={{
                  padding: '1.2rem',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                  backgroundColor: isSelected ? 'var(--primary-bg)' : 'var(--card-bg)',
                  transition: 'all 0.2s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{item.category}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: item.trend === 'up' ? 'var(--success)' : 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {item.trend === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {Math.abs(item.change24h)}%
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatINR(item.farmLinkPrice)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{item.unit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Analytics Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem', marginBottom: '3rem' }} className="market-grid">
          
          {/* Interactive Chart Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRICE TREND ANALYZER</span>
                <h2 style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>{selectedCommodity.name}</h2>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--gray-100)', padding: '4px', borderRadius: '8px' }}>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: timeRange === '7d' ? 'var(--card-bg)' : 'transparent',
                    color: timeRange === '7d' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: timeRange === '7d' ? 'var(--shadow-sm)' : 'none',
                    padding: '4px 12px',
                    fontSize: '0.8rem'
                  }}
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </button>
                <button
                  className="btn btn-sm"
                  style={{
                    backgroundColor: timeRange === '30d' ? 'var(--card-bg)' : 'transparent',
                    color: timeRange === '30d' ? 'var(--primary)' : 'var(--text-muted)',
                    boxShadow: timeRange === '30d' ? 'var(--shadow-sm)' : 'none',
                    padding: '4px 12px',
                    fontSize: '0.8rem'
                  }}
                  onClick={() => setTimeRange('30d')}
                >
                  30 Days
                </button>
              </div>
            </div>

            {/* SVG Interactive Chart */}
            <div style={{ width: '100%', overflowX: 'auto', backgroundColor: 'var(--gray-50)', borderRadius: '12px', padding: '1rem' }}>
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '220px', display: 'block' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75].map((pct, i) => {
                  const y = chartHeight - 30 - pct * (chartHeight - 60);
                  const priceLabel = Math.round(minPrice + pct * (maxPrice - minPrice));
                  return (
                    <g key={i}>
                      <line x1="30" y1={y} x2={chartWidth - 30} y2={y} stroke="var(--gray-200)" strokeDasharray="4,4" />
                      <text x="5" y={y + 4} fontSize="10" fill="var(--text-muted)">₹{priceLabel}</text>
                    </g>
                  );
                })}

                {/* Area Fill */}
                <polygon points={areaPoints} fill="url(#chartGradient)" />

                {/* Line Path */}
                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />

                {/* Data Points */}
                {historyData.map((val, idx) => {
                  const x = (idx / (historyData.length - 1)) * (chartWidth - 60) + 30;
                  const y = chartHeight - 30 - ((val - minPrice) / (maxPrice - minPrice)) * (chartHeight - 60);
                  const isLast = idx === historyData.length - 1;
                  return (
                    <g key={idx}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isLast ? 6 : 4}
                        fill={isLast ? 'var(--primary)' : 'var(--card-bg)'}
                        stroke="var(--primary)"
                        strokeWidth="2.5"
                      />
                      {isLast && (
                        <text x={x - 15} y={y - 12} fontSize="11" fontWeight="bold" fill="var(--primary)">
                          ₹{val}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Key Indicators Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price Stability</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginTop: '4px' }}>{selectedCommodity.stability}</h4>
              </div>
              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Consumer Demand</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--success)', marginTop: '4px' }}>{selectedCommodity.demandScore}/100</h4>
              </div>
              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Harvest Peak</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginTop: '4px' }}>{selectedCommodity.harvestPeak}</h4>
              </div>
            </div>
          </div>

          {/* Direct vs Wholesale Price Comparison Card */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem' }}>Price Transparency Breakdown</h3>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Conventional agricultural supply chains involve 4-6 intermediaries, taking up to 60% in cut. FarmLink connects you directly.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: 'auto' }}>
              {/* Wholesale Mandi */}
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Wholesale Mandi Rate (Paid to farmer)</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {formatINR(selectedCommodity.mandiWholesale)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* FarmLink Direct */}
              <div style={{ border: '2px solid var(--primary)', backgroundColor: 'var(--primary-bg)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    FarmLink Direct (100% to Farmer)
                  </span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {formatINR(selectedCommodity.farmLinkPrice)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(30,86,49,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '75%', height: '100%', backgroundColor: 'var(--primary)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
                  +{Math.round(((selectedCommodity.farmLinkPrice - selectedCommodity.mandiWholesale) / selectedCommodity.mandiWholesale) * 100)}% more income for grower
                </span>
              </div>

              {/* Supermarket Retail */}
              <div style={{ border: '1px solid var(--gray-200)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Supermarket Shelf Price</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--danger)' }}>
                    {formatINR(selectedCommodity.retailSupermarket)}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--gray-200)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--danger)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'inline-block', marginTop: '6px' }}>
                  Consumers save {formatINR(selectedCommodity.retailSupermarket - selectedCommodity.farmLinkPrice)} per {selectedCommodity.unit}
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                <CheckCircle size={16} />
                <span>Zero Broker Commission Policy Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Farmer Profit Margin Simulator */}
        <div className="card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, var(--card-bg) 0%, var(--primary-bg) 100%)', border: '1px solid var(--card-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#ffffff', padding: '0.6rem', borderRadius: '10px' }}>
              <Calculator size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Farmer Direct Revenue Simulator</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0 0' }}>
                Calculate how much extra profit you earn per harvest batch by eliminating middlemen on FarmLink
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }} className="calc-grid">
            <div>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Harvest Volume (Units / Kg / Lb)</label>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{calcQuantity} units</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Conventional Mandi Base Rate</label>
                  <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatINR(calcBasePrice)} / unit</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="5"
                  value={calcBasePrice}
                  onChange={(e) => setCalcBasePrice(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* Simulation Results Card */}
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mandi Middleman Payout</span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatINR(mandiRevenue)}</h3>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>FarmLink Direct Payout</span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginTop: '4px' }}>{formatINR(farmLinkRevenue)}</h3>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--primary-bg)', borderRadius: '12px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>EXTRA PROFIT IN YOUR POCKET</span>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '4px 0 0' }}>
                    +{formatINR(extraEarnings)}
                  </h2>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>
                  +{percentageGain}% ROI
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .market-grid {
            grid-template-columns: 1fr !important;
          }
          .calc-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
