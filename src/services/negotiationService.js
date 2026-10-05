import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_NEG = 'farmlink_negotiations';

const SEED_NEGOTIATIONS = [
  {
    id: 'neg_001',
    customerId: 'demo_customer_001',
    customerName: 'Jane Smith',
    productId: 'prod_1',
    productName: 'Organic Sweet Strawberries',
    farmerId: 'demo_farmer_001',
    farmerName: 'Farmer John Doe',
    originalPrice: 249,
    unit: 'lb',
    requestedQuantity: 25,
    offeredPrice: 215,
    customerMessage: 'Planning a family weekend gathering, would love 25 lbs if ₹215/lb works for you!',
    farmerCounterPrice: 225,
    farmerResponseNote: 'We can meet in the middle at ₹225/lb for 25 lbs with same-day fresh picking.',
    status: 'COUNTER_OFFERED', // 'OFFER_SENT', 'COUNTER_OFFERED', 'ACCEPTED', 'REJECTED'
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

const getLocalNegs = () => {
  const saved = localStorage.getItem(STORAGE_KEY_NEG);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_NEG, JSON.stringify(SEED_NEGOTIATIONS));
    return SEED_NEGOTIATIONS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return SEED_NEGOTIATIONS;
  }
};

const saveLocalNegs = (list) => {
  localStorage.setItem(STORAGE_KEY_NEG, JSON.stringify(list));
};

export const getCustomerNegotiations = async (customerId) => {
  try {
    const q = query(collection(db, 'negotiations'), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getCustomerNegotiations fallback:', err);
  }
  const list = getLocalNegs();
  return list.filter((n) => n.customerId === customerId);
};

export const getFarmerNegotiations = async (farmerId) => {
  try {
    const q = query(collection(db, 'negotiations'), where('farmerId', '==', farmerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getFarmerNegotiations fallback:', err);
  }
  const list = getLocalNegs();
  return list.filter((n) => n.farmerId === farmerId);
};

export const createNegotiationOffer = async ({
  customer,
  product,
  requestedQuantity,
  offeredPrice,
  customerMessage,
}) => {
  const newNeg = {
    customerId: customer.uid,
    customerName: customer.name || customer.email,
    productId: product.id,
    productName: product.name,
    farmerId: product.farmerId || 'demo_farmer_001',
    farmerName: product.farmerName || 'Farmer Partner',
    originalPrice: parseFloat(product.price),
    unit: product.unit || 'unit',
    requestedQuantity: parseFloat(requestedQuantity),
    offeredPrice: parseFloat(offeredPrice),
    customerMessage: customerMessage || '',
    farmerCounterPrice: null,
    farmerResponseNote: '',
    status: 'OFFER_SENT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'negotiations'), {
      ...newNeg,
      createdAt: serverTimestamp(),
    });
    newNeg.id = docRef.id;
  } catch (err) {
    console.warn('createNegotiationOffer fallback:', err);
    newNeg.id = 'neg_' + Date.now();
  }

  const list = getLocalNegs();
  saveLocalNegs([newNeg, ...list]);
  return newNeg;
};

export const respondNegotiation = async (
  negId,
  status,
  counterPrice = null,
  farmerResponseNote = ''
) => {
  const updates = {
    status,
    farmerCounterPrice: counterPrice ? parseFloat(counterPrice) : null,
    farmerResponseNote: farmerResponseNote || '',
    updatedAt: new Date().toISOString(),
  };

  try {
    await updateDoc(doc(db, 'negotiations', negId), updates);
  } catch (err) {
    console.warn('respondNegotiation fallback:', err);
  }

  const list = getLocalNegs().map((n) => (n.id === negId ? { ...n, ...updates } : n));
  saveLocalNegs(list);
  return list;
};
