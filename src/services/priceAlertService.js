import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_ALERTS = 'farmlink_price_alerts';

const SEED_ALERTS = [
  {
    id: 'alt_001',
    userId: 'demo_customer_001',
    userRole: 'customer',
    productName: 'Heirloom Tomatoes',
    targetPrice: 35,
    condition: 'BELOW', // 'BELOW' (customer buy trigger) or 'REACHES' (farmer sell trigger)
    currentPrice: 38,
    unit: 'kg',
    notifyVia: 'In-App & Email',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'alt_002',
    userId: 'demo_farmer_001',
    userRole: 'farmer',
    productName: 'Organic Strawberries',
    targetPrice: 260,
    condition: 'REACHES',
    currentPrice: 249,
    unit: 'lb',
    notifyVia: 'SMS & In-App',
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

const getLocalAlerts = () => {
  const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(SEED_ALERTS));
    return SEED_ALERTS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return SEED_ALERTS;
  }
};

const saveLocalAlerts = (list) => {
  localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(list));
};

export const getUserPriceAlerts = async (userId) => {
  try {
    const q = query(collection(db, 'price_alerts'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getUserPriceAlerts fallback:', err);
  }
  const list = getLocalAlerts();
  return list.filter((a) => a.userId === userId);
};

export const createPriceAlert = async (userId, userRole, data) => {
  const newAlert = {
    userId,
    userRole: userRole || 'customer',
    productName: data.productName,
    targetPrice: parseFloat(data.targetPrice),
    condition: data.condition || (userRole === 'farmer' ? 'REACHES' : 'BELOW'),
    currentPrice: parseFloat(data.currentPrice) || 0,
    unit: data.unit || 'kg',
    notifyVia: data.notifyVia || 'In-App & Push',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'price_alerts'), {
      ...newAlert,
      createdAt: serverTimestamp(),
    });
    newAlert.id = docRef.id;
  } catch (err) {
    console.warn('createPriceAlert fallback:', err);
    newAlert.id = 'alt_' + Date.now();
  }

  const list = getLocalAlerts();
  saveLocalAlerts([newAlert, ...list]);
  return newAlert;
};

export const togglePriceAlertStatus = async (alertId, currentStatus) => {
  const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
  try {
    await updateDoc(doc(db, 'price_alerts', alertId), { status: nextStatus });
  } catch (err) {
    console.warn('togglePriceAlertStatus fallback:', err);
  }
  const list = getLocalAlerts().map((a) => (a.id === alertId ? { ...a, status: nextStatus } : a));
  saveLocalAlerts(list);
  return list;
};

export const deletePriceAlert = async (alertId) => {
  try {
    await deleteDoc(doc(db, 'price_alerts', alertId));
  } catch (err) {
    console.warn('deletePriceAlert fallback:', err);
  }
  const list = getLocalAlerts().filter((a) => a.id !== alertId);
  saveLocalAlerts(list);
  return list;
};
