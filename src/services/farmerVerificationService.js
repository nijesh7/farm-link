import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_VERIF = 'farmlink_farmer_verifications';

const SEED_VERIFICATIONS = {
  demo_farmer_001: {
    farmerId: 'demo_farmer_001',
    farmerName: 'Farmer John Doe',
    farmName: 'Doe Heritage Valley Orchards',
    farmLocation: 'Shimla Valley, Himachal Pradesh',
    farmSize: '18.5 Acres',
    cropsGrown: ['Organic Strawberries', 'Heirloom Tomatoes', 'Baby Spinach', 'Crisp Apples'],
    farmingPractice: 'Natural Vedic Farming, Zero Chemical Spray, Subsurface Drip Irrigation',
    certificationType: 'Official India Organic (NPOP) & PGS-India Green',
    certificationDocNumber: 'NPOP-HP-2026-8819',
    certificationDocUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=600',
    farmImages: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800'
    ],
    contactPhone: '+91 98765 43210',
    contactEmail: 'farmer@farmlink.com',
    status: 'APPROVED', // 'PENDING', 'APPROVED', 'REJECTED', 'INFO_REQUIRED', 'SUSPENDED'
    adminNotes: 'On-site geo-tagging and soil NPOP certificate verified by FarmLink Agri-Auditor.',
    verifiedAt: '2026-03-15T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  farmer_02: {
    farmerId: 'farmer_02',
    farmerName: 'Farmer Sarah Croft',
    farmName: 'Green Valley Heritage Grains',
    farmLocation: 'Hoshangabad, Madhya Pradesh',
    farmSize: '32.0 Acres',
    cropsGrown: ['Heritage Wheat', 'Red Kidney Beans', 'Organic Mustard'],
    farmingPractice: 'Regenerative Agriculture, Organic Vermiculture',
    certificationType: 'PGS-India Green & Fair Trade Certified',
    certificationDocNumber: 'PGS-MP-2025-4412',
    certificationDocUrl: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&q=80&w=600',
    farmImages: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'],
    contactPhone: '+91 98111 22233',
    contactEmail: 'sarah.croft@organicagri.com',
    status: 'APPROVED',
    adminNotes: 'Audited and approved.',
    verifiedAt: '2026-04-10T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  }
};

const getLocalVerifications = () => {
  const saved = localStorage.getItem(STORAGE_KEY_VERIF);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_VERIF, JSON.stringify(SEED_VERIFICATIONS));
    return SEED_VERIFICATIONS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return SEED_VERIFICATIONS;
  }
};

const saveLocalVerifications = (data) => {
  localStorage.setItem(STORAGE_KEY_VERIF, JSON.stringify(data));
};

export const getFarmerVerification = async (farmerId) => {
  try {
    const snap = await getDoc(doc(db, 'farmer_verifications', farmerId));
    if (snap.exists()) {
      return { farmerId, ...snap.data() };
    }
  } catch (err) {
    console.warn('getFarmerVerification fallback:', err);
  }
  const local = getLocalVerifications();
  return local[farmerId] || null;
};

export const getAllFarmerVerifications = async () => {
  try {
    const snap = await getDocs(collection(db, 'farmer_verifications'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ farmerId: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getAllFarmerVerifications fallback:', err);
  }
  const local = getLocalVerifications();
  return Object.values(local);
};

export const submitFarmerVerification = async (farmerId, data) => {
  const payload = {
    farmerId,
    farmerName: data.farmerName,
    farmName: data.farmName,
    farmLocation: data.farmLocation,
    farmSize: data.farmSize,
    cropsGrown: Array.isArray(data.cropsGrown) ? data.cropsGrown : data.cropsGrown?.split(',').map(s => s.trim()) || [],
    farmingPractice: data.farmingPractice,
    certificationType: data.certificationType || 'Self-Declared Organic Practice',
    certificationDocNumber: data.certificationDocNumber || '',
    certificationDocUrl: data.certificationDocUrl || '',
    farmImages: data.farmImages || [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    contactPhone: data.contactPhone || '',
    contactEmail: data.contactEmail || '',
    status: 'PENDING',
    adminNotes: 'Application submitted and queued for verification review.',
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'farmer_verifications', farmerId), {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('submitFarmerVerification fallback:', err);
  }

  const local = getLocalVerifications();
  local[farmerId] = payload;
  saveLocalVerifications(local);
  return payload;
};

export const updateFarmerVerificationStatus = async (farmerId, status, adminNotes = '') => {
  const updates = {
    status,
    adminNotes,
    verifiedAt: status === 'APPROVED' ? new Date().toISOString() : null,
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'farmer_verifications', farmerId), updates);
  } catch (err) {
    console.warn('updateFarmerVerificationStatus fallback:', err);
  }

  const local = getLocalVerifications();
  if (local[farmerId]) {
    local[farmerId] = { ...local[farmerId], ...updates };
  } else {
    local[farmerId] = { farmerId, ...updates };
  }
  saveLocalVerifications(local);
  return local[farmerId];
};
