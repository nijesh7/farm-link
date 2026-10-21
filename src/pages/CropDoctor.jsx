import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Leaf, 
  FileText, 
  Info, 
  RefreshCw, 
  Download, 
  ExternalLink,
  ChevronRight,
  Bug,
  Droplets,
  Calendar
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { getPresetDiseaseSamples, diagnoseCropImage } from '../services/cropDoctorService';

export default function CropDoctor() {
  const { showToast } = useToast();
  const presets = getPresetDiseaseSamples();

  const [selectedPresetId, setSelectedPresetId] = useState(presets[0].id);
  const [customImage, setCustomImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState(presets[0]);
  const [activeTab, setActiveTab] = useState('organic'); // 'organic' | 'chemical' | 'prevention'
  const [showRxModal, setShowRxModal] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setCustomImage(null);
    runAiScan(preset.id);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result);
      setSelectedPresetId('custom');
      runAiScan(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const runAiScan = (idOrImg) => {
    setIsScanning(true);
    setTimeout(() => {
      const result = diagnoseCropImage(idOrImg);
      setDiagnosis(result);
      setIsScanning(false);
      showToast(`AI Scan Complete: ${result.diseaseName}`, 'success');
    }, 1200);
  };

  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'Critical': return 'badge-danger';
      case 'Severe': return 'badge-warning';
      case 'Moderate': return 'badge-warning';
      case 'None': return 'badge-success';
      default: return 'badge-info';
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-50)', minHeight: '100vh', padding: '2.5rem 1rem 5rem' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* Header Hero */}
        <div style={{ 
          background: 'linear-gradient(135deg, var(--primary) 0%, #133a21 100%)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '2.5rem 2rem', 
          color: '#ffffff',
          marginBottom: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '750px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.9rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
              <Sparkles size={16} color="#ffd54f" />
              <span>AgriVision AI 4.2 • Computer Vision Plant Pathology</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '0 0 0.8rem', lineHeight: 1.2 }}>
              AI Crop Doctor & Disease Diagnostics
            </h1>
            <p style={{ fontSize: '1.05rem', opacity: 0.9, margin: 0, lineHeight: 1.6 }}>
              Instant neural detection of pests, fungal infections, and nutrient chlorosis from photos. Get certified organic bio-remedies, chemical dosages, and spray calendars.
            </p>
          </div>

          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.12, pointerEvents: 'none' }}>
            <Leaf size={280} />
          </div>
        </div>

        {/* Main Grid: Upload & Presets (Left) + AI Diagnostics Report (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          
          {/* Left Column: Image Selector & Scanning View */}
          <div>
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={20} color="var(--primary)" />
                1. Inspect Crop Sample
              </h3>

              {/* Live Scanner Frame */}
              <div style={{ 
                position: 'relative', 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden', 
                border: '2px solid var(--gray-200)',
                height: '280px',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <img 
                  src={customImage || diagnosis?.sampleImage} 
                  alt="Crop sample" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isScanning ? 0.6 : 1, transition: 'opacity 0.3s' }} 
                />

                {/* Laser scan line overlay */}
                {isScanning && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: '#00ff88',
                    boxShadow: '0 0 15px #00ff88, 0 0 30px #00ff88',
                    animation: 'pulse 1.2s infinite ease-in-out'
                  }}></div>
                )}

                {/* Center Scanning Badge */}
                {isScanning && (
                  <div style={{
                    position: 'absolute',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    color: '#00ff88',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.4)'
                  }}>
                    <RefreshCw size={16} className="spinning" />
                    Analyzing leaf venation & lesion morphology...
                  </div>
                )}

                {/* Bottom crop tag */}
                {!isScanning && diagnosis && (
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    color: '#fff',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    backdropFilter: 'blur(4px)'
                  }}>
                    Crop: <strong>{diagnosis.crop}</strong> ({diagnosis.cropHindi})
                  </div>
                )}
              </div>

              {/* Upload Custom Photo Input */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '0.85rem',
                border: '2px dashed var(--primary-light)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-bg)',
                color: 'var(--primary)',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '1.5rem',
                transition: 'var(--transition)'
              }}>
                <Upload size={18} />
                <span>Upload Your Leaf / Crop Photo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>

              {/* Presets List */}
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Or select from certified agronomy field samples:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '0.6rem' }}>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      border: selectedPresetId === preset.id ? '2px solid var(--primary)' : '1px solid var(--gray-200)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem',
                      backgroundColor: selectedPresetId === preset.id ? 'var(--primary-bg)' : 'var(--card-bg)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'var(--transition)'
                    }}
                  >
                    <img 
                      src={preset.sampleImage} 
                      alt={preset.crop} 
                      style={{ width: '100%', height: '55px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.25rem' }} 
                    />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.crop}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Hotline Card */}
            <div className="card" style={{ padding: '1.25rem', backgroundColor: 'var(--card-bg)', border: '1px solid var(--gray-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldCheck size={28} color="var(--primary)" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Krishi Vigyan Advisory Network</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified by ICAR-certified plant protection agronomists</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Diagnostics & Action Protocol */}
          <div>
            <div className="card" style={{ padding: '2rem', border: '1px solid var(--gray-200)', position: 'relative' }}>
              
              {/* Top Banner Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--gray-100)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <span className={`badge ${getSeverityBadgeClass(diagnosis.severity)}`}>
                      Severity: {diagnosis.severity}
                    </span>
                    <span className="badge" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)', color: 'var(--info)' }}>
                      {diagnosis.pathogenType}
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text-main)' }}>
                    {diagnosis.diseaseName}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertTriangle size={14} />
                    {diagnosis.urgencyLevel}
                  </div>
                </div>

                {/* Accuracy Score Pill */}
                <div style={{ 
                  textAlign: 'center', 
                  backgroundColor: 'var(--primary-bg)', 
                  border: '1px solid var(--primary-light)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '0.6rem 1rem' 
                }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                    AI Confidence
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {diagnosis.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Metric stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Yield Risk</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--danger)' }}>
                    {diagnosis.estimatedYieldLossRisk}
                  </div>
                </div>
                <div style={{ backgroundColor: 'var(--gray-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Weather Spread Vulnerability</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    High in Overcast &gt;80% RH
                  </div>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bug size={16} color="var(--primary)" />
                  Observed Clinical Symptoms
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {diagnosis.symptoms.map((sym, idx) => (
                    <li key={idx} style={{ marginBottom: '0.35rem' }}>{sym}</li>
                  ))}
                </ul>
              </div>

              {/* Treatment Tabs */}
              <div style={{ borderBottom: '1px solid var(--gray-200)', display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  onClick={() => setActiveTab('organic')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'organic' ? '3px solid var(--primary)' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 'organic' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Leaf size={16} />
                  🌿 Organic & Bio-Remedies
                </button>
                <button
                  onClick={() => setActiveTab('chemical')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'chemical' ? '3px solid var(--primary)' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 'chemical' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Droplets size={16} />
                  🧪 Controlled Chemical Spray
                </button>
                <button
                  onClick={() => setActiveTab('prevention')}
                  style={{
                    padding: '0.6rem 1rem',
                    border: 'none',
                    borderBottom: activeTab === 'prevention' ? '3px solid var(--primary)' : '3px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === 'prevention' ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <ShieldCheck size={16} />
                  🛡️ Cultural Prevention
                </button>
              </div>

              {/* Tab Contents */}
              <div style={{ minHeight: '130px', marginBottom: '1.75rem' }}>
                {activeTab === 'organic' && (
                  <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Zero-Chemical Organic Action Plan
                    </div>
                    {diagnosis.organicTreatment.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        <CheckCircle2 size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'chemical' && (
                  <div style={{ backgroundColor: 'rgba(241, 196, 15, 0.08)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--warning)' }}>
                    <div style={{ fontWeight: 700, color: '#997300', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Recommended Dosage & Safe Withholding Periods
                    </div>
                    {diagnosis.chemicalTreatment.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        <Droplets size={16} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'prevention' && (
                  <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', borderLeft: '4px solid var(--info)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--info)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Long-Term Agronomic Sanitation
                    </div>
                    {diagnosis.preventiveTips.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.88rem', lineHeight: 1.5 }}>
                        <ShieldCheck size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setShowRxModal(true)}
                >
                  <FileText size={18} />
                  <span>Download Rx Agronomy Slip</span>
                </button>
                <button 
                  className="btn btn-secondary" 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => showToast('Connecting to Krishi Vigyan Agronomist on call...', 'info')}
                >
                  <ExternalLink size={18} />
                  <span>Speak to Scientist</span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Prescription Modal */}
      {showRxModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '92%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Leaf size={22} /> FarmLink AI Pathology Prescription Slip
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reference ID: FL-PATH-{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
              <button 
                onClick={() => setShowRxModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              <p><strong>Target Crop:</strong> {diagnosis.crop} ({diagnosis.cropHindi})</p>
              <p><strong>Diagnosed Pathogen:</strong> {diagnosis.diseaseName}</p>
              <p><strong>Severity Grade:</strong> {diagnosis.severity} ({diagnosis.confidenceScore}% AI Confidence)</p>
              <div style={{ backgroundColor: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius-sm)', margin: '1rem 0' }}>
                <strong>Immediate Spray Protocol:</strong>
                <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                  {diagnosis.organicTreatment.concat(diagnosis.chemicalTreatment).map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '0.3rem' }}>{step}</li>
                  ))}
                </ol>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                *Always adhere to protective gear guidelines when mixing sprays. Comply with Central Insecticides Board & Registration Committee (CIBRC) standards.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowRxModal(false)}>Close</button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  showToast('Rx Prescription downloaded successfully to your device!', 'success');
                  setShowRxModal(false);
                }}
              >
                <Download size={16} /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
