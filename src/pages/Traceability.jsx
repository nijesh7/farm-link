import React, { useState } from 'react';
import {
  QrCode,
  Search,
  ShieldCheck,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  Droplets,
  Sun,
  Thermometer,
  FileCheck,
  Truck,
  Leaf,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TRACEABLE_BATCHES = {
  'BATCH-STR-8841': {
    batchId: 'BATCH-STR-8841',
    productName: 'Organic Sweet Strawberries',
    variety: 'Albion Heirloom Cultivar',
    category: 'Fruits',
    farmerName: 'Farmer John Doe',
    farmName: 'Doe Family Heritage Orchards',
    location: 'Shimla Valley, Himachal Pradesh, India',
    geoCoordinates: '31.1048° N, 77.1734° E',
    elevation: '2,200m ASL',
    sowingDate: 'October 15, 2025',
    harvestDate: 'September 28, 2026 (05:30 AM IST)',
    dispatchDate: 'September 29, 2026',
    soilPh: '6.4 (Optimal Loamy)',
    irrigationSource: 'Pure Himalayan Glacier Melt & Drip Feed',
    pesticideResidue: '0.00 ppm (ND - Not Detected)',
    brixSweetness: '11.8° Brix (Superior Grade)',
    organicCertNo: 'IN-ORG-2026-9941',
    certifications: ['India Organic NPOP', 'USDA Organic Equivalent', 'Zero Residue Certified', 'Fair Trade Certified'],
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800',
    farmerAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=300',
    timeline: [
      {
        step: '1. Seed & Root Inoculation',
        date: 'Oct 15, 2025',
        desc: 'Certified non-GMO organic runners treated with mycorrhizal bio-inoculants for root resilience.',
        status: 'completed'
      },
      {
        step: '2. Natural Enrichment & Drip Feed',
        date: 'Dec 2025 - Aug 2026',
        desc: 'Nourished exclusively with aged vermicompost, seaweed extract, and automated subsurface drip lines.',
        status: 'completed'
      },
      {
        step: '3. Pre-Harvest Quality & Brix Testing',
        date: 'Sep 25, 2026',
        desc: 'Brix sweetness verified at 11.8°. Spectrometry test confirmed zero synthetic chemical residues.',
        status: 'completed'
      },
      {
        step: '4. Dawn Harvest & Cold Sorting',
        date: 'Sep 28, 2026 (05:30 AM)',
        desc: 'Hand-picked in cool pre-dawn hours to lock in sugars. Packed in breathable biodegradable punnets at 4°C.',
        status: 'completed'
      },
      {
        step: '5. QR Tracked Dispatch to Hub',
        date: 'Sep 29, 2026',
        desc: 'Temperature-monitored refrigerated van dispatched to local FarmLink regional fulfilment node.',
        status: 'completed'
      }
    ]
  },
  'BATCH-TOM-2026': {
    batchId: 'BATCH-TOM-2026',
    productName: 'Vine-Ripened Heirloom Tomatoes',
    variety: 'Cherokee Purple & Brandywine',
    category: 'Vegetables',
    farmerName: 'Farmer John Doe',
    farmName: 'Doe Family Heritage Orchards',
    location: 'Kullu Green Belt, Himachal Pradesh',
    geoCoordinates: '31.9579° N, 77.1095° E',
    elevation: '1,250m ASL',
    sowingDate: 'May 10, 2026',
    harvestDate: 'September 30, 2026 (06:00 AM IST)',
    dispatchDate: 'October 01, 2026',
    soilPh: '6.7 (Rich Alluvial Loam)',
    irrigationSource: 'Solar Powered Deep Aquifer Drip',
    pesticideResidue: '0.00 ppm (Zero Residue Verified)',
    brixSweetness: '6.2° Brix (Rich Umami & Lycopene)',
    organicCertNo: 'IN-ORG-2026-8812',
    certifications: ['India Organic NPOP', 'Jaivik Bharat', 'Non-GMO Project Verified'],
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=800',
    farmerAvatar: 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?auto=format&fit=crop&q=80&w=300',
    timeline: [
      {
        step: '1. Heirloom Seed Germination',
        date: 'May 10, 2026',
        desc: 'Open-pollinated heritage seeds germinated in organic coco-peat nursery beds.',
        status: 'completed'
      },
      {
        step: '2. Neem Shield & Companion Planting',
        date: 'Jun - Aug 2026',
        desc: 'Intercropped with French marigolds to naturally repel nematodes; foliar sprayed with neem cake.',
        status: 'completed'
      },
      {
        step: '3. Brix & Lycopene Spectrometry',
        date: 'Sep 27, 2026',
        desc: 'High lycopene content confirmed. Heavy metal (Lead/Cadmium) lab test 100% negative.',
        status: 'completed'
      },
      {
        step: '4. Vine-Ripened Selective Picking',
        date: 'Sep 30, 2026',
        desc: 'Harvested only at full color break stage for exceptional farm-to-table culinary aroma.',
        status: 'completed'
      },
      {
        step: '5. Dispatched in Corrugated Vented Crates',
        date: 'Oct 01, 2026',
        desc: 'Secured in recyclable paper trays for zero bruising transit.',
        status: 'completed'
      }
    ]
  },
  'BATCH-WHT-9021': {
    batchId: 'BATCH-WHT-9021',
    productName: 'Whole Grain Heirloom Wheat',
    variety: 'Emmer (Khapli) Ancient Wheat',
    category: 'Grains',
    farmerName: 'Farmer Sarah Croft',
    farmName: 'Sunstone Organic Agronomy',
    location: 'Hoshangabad Plains, Madhya Pradesh',
    geoCoordinates: '22.7519° N, 77.7289° E',
    elevation: '300m ASL',
    sowingDate: 'November 20, 2025',
    harvestDate: 'March 18, 2026',
    dispatchDate: 'March 25, 2026',
    soilPh: '7.2 (Black Cotton Soil)',
    irrigationSource: 'Rainfed & Canal Supplemental Drip',
    pesticideResidue: '0.00 ppm (100% Chemical Free)',
    brixSweetness: 'Low Glycemic Ancient Gluten',
    organicCertNo: 'IN-ORG-2026-4401',
    certifications: ['India Organic NPOP', 'Ancient Grain Certified', 'Gluten Tolerant Ancient Grain'],
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    farmerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    timeline: [
      {
        step: '1. Ancient Seed Preservation Sowing',
        date: 'Nov 20, 2025',
        desc: 'Indigenous Emmer seeds unhybridized for 1,000+ years sown in organic black soil.',
        status: 'completed'
      },
      {
        step: '2. Jeevamrutha Organic Ferment',
        date: 'Dec 2025 - Feb 2026',
        desc: 'Fed with traditional cow dung and jaggery bio-ferment to stimulate natural nitrogen fixation.',
        status: 'completed'
      },
      {
        step: '3. Sun Drying & Stoneground Milling',
        date: 'Mar 18, 2026',
        desc: 'Naturally sun-cured and slow stoneground to protect dietary fiber, vitamins B & E.',
        status: 'completed'
      },
      {
        step: '4. Nitrogen-Flushed Jute Bags',
        date: 'Mar 25, 2026',
        desc: 'Packaged in unbleached jute sacks with oxygen absorbers for 12 months shelf freshness.',
        status: 'completed'
      }
    ]
  }
};

export default function Traceability() {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-STR-8841');

  const batch = TRACEABLE_BATCHES[selectedBatchId] || TRACEABLE_BATCHES['BATCH-STR-8841'];

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchInput.trim().toUpperCase();
    if (!query) return;

    if (TRACEABLE_BATCHES[query]) {
      setSelectedBatchId(query);
      showToast(`Verified Batch ${query} found!`, 'success');
    } else {
      showToast(`Batch code "${searchInput}" not found. Try BATCH-STR-8841 or BATCH-TOM-2026`, 'error');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', flex: 1, padding: '3rem 0' }}>
      <div className="container">
        
        {/* Hero Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
            <ShieldCheck size={14} /> 100% Cryptographic Farm-to-Fork Traceability
          </span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Verify Your Food's Exact Journey
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6' }}>
            Scan the QR code on your FarmLink packaging or enter your Batch ID below to inspect soil health, harvest logs, and pesticide lab reports.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearch}
            style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '2rem',
              backgroundColor: 'var(--card-bg)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--gray-200)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, paddingLeft: '1rem' }}>
              <QrCode size={20} color="var(--primary)" />
              <input
                type="text"
                placeholder="Enter Batch ID (e.g. BATCH-STR-8841, BATCH-TOM-2026)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.95rem',
                  color: 'var(--text-main)'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.4rem' }}>
              <Search size={16} />
              <span>Verify Batch</span>
            </button>
          </form>

          {/* Quick Select Preset Batch Codes */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick test samples:</span>
            {Object.keys(TRACEABLE_BATCHES).map((id) => (
              <button
                key={id}
                onClick={() => setSelectedBatchId(id)}
                style={{
                  background: 'none',
                  border: '1px dashed var(--primary-light)',
                  color: 'var(--primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {/* Traceability Details Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem' }} className="trace-grid">
          
          {/* Left Column: Farm & Product Spec Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', height: '220px' }}>
                <img
                  src={batch.imageUrl}
                  alt={batch.productName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="badge badge-primary" style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                  {batch.batchId}
                </span>
                <span className="badge badge-success" style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  ✓ Lab Verified
                </span>
              </div>

              <div style={{ padding: '1.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                  {batch.variety}
                </span>
                <h2 style={{ fontSize: '1.6rem', margin: '0.25rem 0 1rem' }}>{batch.productName}</h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: '12px', marginBottom: '1.5rem' }}>
                  <img
                    src={batch.farmerAvatar}
                    alt={batch.farmerName}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>{batch.farmerName}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{batch.farmName}</span>
                  </div>
                </div>

                {/* Geo & Agronomic Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={15} /> Farm Location:
                    </span>
                    <span style={{ fontWeight: 600 }}>{batch.location}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sun size={15} /> Coordinates:
                    </span>
                    <span style={{ fontFamily: 'monospace' }}>{batch.geoCoordinates}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={15} /> Soil pH & Quality:
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{batch.soilPh}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-100)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Droplets size={15} /> Irrigation:
                    </span>
                    <span style={{ fontWeight: 600 }}>{batch.irrigationSource}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={15} /> Sweetness / Grade:
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--success)' }}>{batch.brixSweetness}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certifications Badge Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <FileCheck size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.1rem' }}>Verified Certifications</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                {batch.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--primary-bg)',
                      color: 'var(--primary)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      border: '1px solid var(--primary-light)'
                    }}
                  >
                    ✓ {cert}
                  </span>
                ))}
              </div>
              <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <strong>Govt Certificate ID:</strong> {batch.organicCertNo}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Journey Timeline */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>CROP LIFECYCLE AUDIT</span>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.2rem' }}>Farm-to-Fork Timeline</h2>
              </div>
              <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem' }}>
                Pesticide Residue: 0.00 ppm
              </span>
            </div>

            {/* Timeline Steps */}
            <div style={{ position: 'relative', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Vertical connecting line */}
              <div
                style={{
                  position: 'absolute',
                  left: '11px',
                  top: '12px',
                  bottom: '12px',
                  width: '3px',
                  backgroundColor: 'var(--primary)',
                  borderRadius: '2px'
                }}
              />

              {batch.timeline.map((step, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  {/* Step Icon circle */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-2rem',
                      top: '0',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 4px var(--primary-bg)'
                    }}
                  >
                    <CheckCircle2 size={15} />
                  </div>

                  <div style={{ backgroundColor: 'var(--gray-50)', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid var(--gray-200)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '4px' }}>
                      <h4 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--primary)' }}>{step.step}</h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {step.date}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5', margin: 0 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Guarantee Callout Banner */}
            <div
              style={{
                marginTop: '2.5rem',
                padding: '1.25rem 1.5rem',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#ffffff' }}>Every Bite 100% Accountable</h4>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
                  Zero cold-storage chemical ripening agents. Sourced within 24 hours of dispatch.
                </p>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '20px' }}>
                Batch Sealed
              </span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .trace-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
