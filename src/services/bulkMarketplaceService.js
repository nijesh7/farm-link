import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_REQ = 'farmlink_bulk_requirements';
const STORAGE_KEY_OFFERS = 'farmlink_bulk_offers';

const SEED_REQUIREMENTS = [
  {
    id: 'req_001',
    buyerId: 'demo_buyer_001',
    buyerName: 'Grand Heritage Hotel & Bistro',
    buyerType: 'Hotel / Restaurant',
    product: 'Farm-Fresh Heirloom Tomatoes',
    category: 'Vegetables',
    requiredQuantity: 250,
    unit: 'kg',
    maxBudgetPerUnit: 24,
    requiredDate: 'Tomorrow Morning',
    deliveryLocation: 'Indiranagar Central Kitchen, Bangalore',
    qualityRequirements: 'Grade A, firm skin, minimum 60mm diameter, zero synthetic pesticide residues',
    additionalNotes: 'Need weekly dispatch on morning hours. Partial fulfilment from certified farmers acceptable.',
    status: 'OFFERS RECEIVED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'req_002',
    buyerId: 'buyer_002',
    buyerName: 'GreenRoots University Canteen',
    buyerType: 'Institution / Canteen',
    product: 'Organic Crisp Baby Spinach',
    category: 'Leafy Greens',
    requiredQuantity: 100,
    unit: 'bunch',
    maxBudgetPerUnit: 18,
    requiredDate: 'In 2 Days',
    deliveryLocation: 'Electronic City Phase 1, Bangalore',
    qualityRequirements: 'Harvested within 24h of dispatch, pre-washed, cold-stored at 4°C',
    additionalNotes: 'Strict quality inspection upon arrival at gate. Payment within 24 hours of delivery.',
    status: 'POSTED',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'req_003',
    buyerId: 'buyer_003',
    buyerName: 'Artisan Sourdough Bakery & Cafe',
    buyerType: 'Bakery / Cafe',
    product: 'Heirloom Heritage Wheat Grains',
    category: 'Grains',
    requiredQuantity: 500,
    unit: 'kg',
    maxBudgetPerUnit: 32,
    requiredDate: 'In 3 Days',
    deliveryLocation: 'Koramangala 4th Block, Bangalore',
    qualityRequirements: 'Traditional Bansi/Khapli variety, stone-cleaned, moisture under 11%',
    additionalNotes: 'Looking to form a long-term direct contract with farmer cooperatives.',
    status: 'NEGOTIATING',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

const SEED_OFFERS = [
  {
    id: 'off_001',
    requirementId: 'req_001',
    farmerId: 'demo_farmer_001',
    farmerName: 'Farmer John Doe',
    farmName: 'Doe Heritage Valley Orchards',
    offeredQuantity: 150,
    unit: 'kg',
    offeredPrice: 22,
    deliveryDate: 'Tomorrow by 8:30 AM',
    farmLocation: 'Kolar Organic Belt / Bangalore North',
    additionalMessage: 'We can dispatch 150 kg Grade-A organic tomatoes harvested same-day via local transport.',
    status: 'ACCEPTED',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'off_002',
    requirementId: 'req_001',
    farmerId: 'farmer_02',
    farmerName: 'Farmer Sarah Croft',
    farmName: 'Green Valley Organic Farms',
    offeredQuantity: 100,
    unit: 'kg',
    offeredPrice: 23,
    deliveryDate: 'Tomorrow by 9:00 AM',
    farmLocation: 'Hoskote Farms, Karnataka',
    additionalMessage: 'We can cover the remaining 100 kg allocation from our polyhouse harvest.',
    status: 'OFFERED',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
  }
];

// Helper to get local requirements
const getLocalReqs = () => {
  const saved = localStorage.getItem(STORAGE_KEY_REQ);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_REQ, JSON.stringify(SEED_REQUIREMENTS));
    return SEED_REQUIREMENTS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (parsed.length > 0 && (parsed[0].maxBudgetPerUnit > 35 || parsed[0].requiredDate.includes('2026-10-18'))) {
      localStorage.setItem(STORAGE_KEY_REQ, JSON.stringify(SEED_REQUIREMENTS));
      return SEED_REQUIREMENTS;
    }
    return parsed;
  } catch (e) {
    return SEED_REQUIREMENTS;
  }
};

const saveLocalReqs = (reqs) => {
  localStorage.setItem(STORAGE_KEY_REQ, JSON.stringify(reqs));
};

// Helper to get local offers
const getLocalOffers = () => {
  const saved = localStorage.getItem(STORAGE_KEY_OFFERS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(SEED_OFFERS));
    return SEED_OFFERS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (parsed.length > 0 && parsed[0].offeredPrice > 30) {
      localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(SEED_OFFERS));
      return SEED_OFFERS;
    }
    return parsed;
  } catch (e) {
    return SEED_OFFERS;
  }
};

const saveLocalOffers = (offers) => {
  localStorage.setItem(STORAGE_KEY_OFFERS, JSON.stringify(offers));
};

export const getBulkRequirements = async () => {
  try {
    const q = query(collection(db, 'bulk_requirements'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getBulkRequirements fallback:', err);
  }
  return getLocalReqs();
};

export const createBulkRequirement = async (data, buyer) => {
  const newReq = {
    buyerId: buyer.uid,
    buyerName: buyer.name || buyer.email,
    buyerType: data.buyerType || 'Institution / Buyer',
    product: data.product,
    category: data.category || 'Vegetables',
    requiredQuantity: parseFloat(data.requiredQuantity),
    unit: data.unit || 'kg',
    maxBudgetPerUnit: parseFloat(data.maxBudgetPerUnit),
    requiredDate: data.requiredDate,
    deliveryLocation: data.deliveryLocation,
    qualityRequirements: data.qualityRequirements || 'Standard Organic Grade',
    additionalNotes: data.additionalNotes || '',
    status: 'POSTED',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'bulk_requirements'), {
      ...newReq,
      createdAt: serverTimestamp(),
    });
    newReq.id = docRef.id;
  } catch (err) {
    console.warn('createBulkRequirement firestore fallback:', err);
    newReq.id = 'req_' + Date.now();
  }

  const list = getLocalReqs();
  saveLocalReqs([newReq, ...list]);
  return newReq;
};

export const updateBulkRequirementStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, 'bulk_requirements', id), { status });
  } catch (err) {
    console.warn('updateBulkRequirementStatus error/fallback:', err);
  }
  const list = getLocalReqs().map((r) => (r.id === id ? { ...r, status } : r));
  saveLocalReqs(list);
  return list;
};

export const getBulkOffers = async (requirementId) => {
  try {
    const q = query(collection(db, 'bulk_offers'), where('requirementId', '==', requirementId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getBulkOffers fallback:', err);
  }
  const allOffers = getLocalOffers();
  return allOffers.filter((o) => o.requirementId === requirementId);
};

export const getAllBulkOffers = async () => {
  try {
    const snap = await getDocs(collection(db, 'bulk_offers'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getAllBulkOffers fallback:', err);
  }
  return getLocalOffers();
};

export const submitBulkOffer = async (requirementId, offerData, farmer) => {
  const newOffer = {
    requirementId,
    farmerId: farmer.uid,
    farmerName: farmer.name || 'Verified Farmer Partner',
    farmName: offerData.farmName || 'Farmer Natural Farm',
    offeredQuantity: parseFloat(offerData.offeredQuantity),
    unit: offerData.unit || 'kg',
    offeredPrice: parseFloat(offerData.offeredPrice),
    deliveryDate: offerData.deliveryDate,
    farmLocation: offerData.farmLocation || farmer.address || 'Local Region',
    additionalMessage: offerData.additionalMessage || '',
    status: 'OFFERED',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'bulk_offers'), {
      ...newOffer,
      createdAt: serverTimestamp(),
    });
    newOffer.id = docRef.id;
  } catch (err) {
    console.warn('submitBulkOffer firestore fallback:', err);
    newOffer.id = 'off_' + Date.now();
  }

  const allOffers = getLocalOffers();
  saveLocalOffers([newOffer, ...allOffers]);

  // Update requirement status to 'OFFERS RECEIVED' if it was 'POSTED'
  const reqs = getLocalReqs();
  const targetReq = reqs.find((r) => r.id === requirementId);
  if (targetReq && targetReq.status === 'POSTED') {
    await updateBulkRequirementStatus(requirementId, 'OFFERS RECEIVED');
  }

  return newOffer;
};

export const acceptBulkOffer = async (requirementId, offerId, buyerId) => {
  try {
    await updateDoc(doc(db, 'bulk_offers', offerId), { status: 'ACCEPTED' });
  } catch (err) {
    console.warn('acceptBulkOffer firestore fallback:', err);
  }

  const allOffers = getLocalOffers().map((o) =>
    o.id === offerId ? { ...o, status: 'ACCEPTED' } : o
  );
  saveLocalOffers(allOffers);

  // Check total fulfilled quantity for this requirement
  const reqOffers = allOffers.filter(
    (o) => o.requirementId === requirementId && o.status === 'ACCEPTED'
  );
  const totalAcceptedQty = reqOffers.reduce((sum, o) => sum + (o.offeredQuantity || 0), 0);

  const reqs = getLocalReqs();
  const targetReq = reqs.find((r) => r.id === requirementId);
  if (targetReq) {
    let nextStatus = 'NEGOTIATING';
    if (totalAcceptedQty >= targetReq.requiredQuantity) {
      nextStatus = 'FULFILLED';
    } else if (totalAcceptedQty > 0) {
      nextStatus = 'PARTIALLY FULFILLED';
    }
    await updateBulkRequirementStatus(requirementId, nextStatus);
  }

  return { offerId, requirementId, status: 'ACCEPTED' };
};
