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

const STORAGE_KEY_SUBS = 'farmlink_subscriptions';

const SEED_SUBSCRIPTIONS = [
  {
    id: 'sub_001',
    userId: 'demo_customer_001',
    userName: 'Jane Smith',
    basketType: 'Weekly Organic Harvest Box',
    category: 'Vegetables & Leafy Greens',
    frequency: 'Weekly',
    deliveryDay: 'Wednesday',
    approximateWeight: '5-6 kg',
    pricePerCycle: 299,
    preferredItems: ['Baby Spinach', 'Heirloom Tomatoes', 'Carrots', 'Coriander'],
    deliveryAddress: '45 Green Meadow Lane, Indiranagar, Bangalore',
    phone: '+91 98765 43210',
    status: 'ACTIVE', // 'ACTIVE', 'PAUSED', 'SKIPPED_NEXT', 'CANCELLED'
    nextDeliveryDate: 'Tomorrow (Oct 06, 2026)',
    totalDeliveriesCompleted: 5,
    createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
  }
];

const getLocalSubs = () => {
  const saved = localStorage.getItem(STORAGE_KEY_SUBS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(SEED_SUBSCRIPTIONS));
    return SEED_SUBSCRIPTIONS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (parsed.length > 0 && parsed[0].pricePerCycle > 500) {
      localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(SEED_SUBSCRIPTIONS));
      return SEED_SUBSCRIPTIONS;
    }
    return parsed;
  } catch (e) {
    return SEED_SUBSCRIPTIONS;
  }
};

const saveLocalSubs = (subs) => {
  localStorage.setItem(STORAGE_KEY_SUBS, JSON.stringify(subs));
};

export const getUserSubscriptions = async (userId) => {
  try {
    const q = query(collection(db, 'subscriptions'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getUserSubscriptions fallback:', err);
  }
  const local = getLocalSubs();
  return local.filter((s) => s.userId === userId);
};

export const getAllSubscriptions = async () => {
  try {
    const snap = await getDocs(collection(db, 'subscriptions'));
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getAllSubscriptions fallback:', err);
  }
  return getLocalSubs();
};

export const createSubscription = async (userId, data, user) => {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 7);

  const newSub = {
    userId,
    userName: user.name || user.email,
    basketType: data.basketType || 'Custom Farm Basket',
    category: data.category || 'Mixed Produce',
    frequency: data.frequency || 'Weekly',
    deliveryDay: data.deliveryDay || 'Sunday',
    approximateWeight: data.approximateWeight || '5 kg',
    pricePerCycle: parseFloat(data.pricePerCycle) || 599,
    preferredItems: data.preferredItems || [],
    deliveryAddress: data.deliveryAddress || user.address || 'User Address',
    phone: data.phone || user.phone || '',
    status: 'ACTIVE',
    nextDeliveryDate: nextDate.toISOString().split('T')[0],
    totalDeliveriesCompleted: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'subscriptions'), {
      ...newSub,
      createdAt: serverTimestamp(),
    });
    newSub.id = docRef.id;
  } catch (err) {
    console.warn('createSubscription fallback:', err);
    newSub.id = 'sub_' + Date.now();
  }

  const list = getLocalSubs();
  saveLocalSubs([newSub, ...list]);
  return newSub;
};

export const updateSubscriptionStatus = async (subId, newStatus) => {
  try {
    await updateDoc(doc(db, 'subscriptions', subId), { status: newStatus });
  } catch (err) {
    console.warn('updateSubscriptionStatus fallback:', err);
  }

  const list = getLocalSubs().map((s) => (s.id === subId ? { ...s, status: newStatus } : s));
  saveLocalSubs(list);
  return list;
};
