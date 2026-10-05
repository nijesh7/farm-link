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

const STORAGE_KEY_NOTIFS = 'farmlink_notifications';

const SEED_NOTIFICATIONS = [
  {
    id: 'notif_001',
    userId: 'demo_farmer_001',
    title: '🌾 High Local Demand Detected',
    message: 'High regional demand detected for Organic Tomatoes (55 kg aggregated) in Bangalore South cluster.',
    category: 'DEMAND', // 'DEMAND', 'BULK', 'PRICE', 'STOCK', 'ORDER'
    isRead: false,
    link: '/bulk-marketplace',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'notif_002',
    userId: 'demo_farmer_001',
    title: '🏪 Restaurant Bulk Tender: 500 kg Tomatoes',
    message: 'Grand Heritage Hotel & Bistro posted a new bulk tender at ₹38/kg max budget. Submit your offer now.',
    category: 'BULK',
    isRead: false,
    link: '/bulk-marketplace',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'notif_003',
    userId: 'demo_farmer_001',
    title: '📈 Target Price Reached',
    message: 'Your target market price for Organic Strawberries reached ₹249/lb in the APMC trends index.',
    category: 'PRICE',
    isRead: true,
    link: '/market-trends',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'notif_004',
    userId: 'demo_farmer_001',
    title: '⚠️ Low Stock Advisory',
    message: 'Farm Fresh Organic Eggs has reached low inventory threshold (less than 20 units remaining).',
    category: 'STOCK',
    isRead: false,
    link: '/farmer',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'notif_005',
    userId: 'demo_customer_001',
    title: '🎉 Harvest Reservation Update',
    message: 'Your pre-ordered batch of Strawberries (BATCH-STR-8841) has entered pre-harvest Brix quality verification!',
    category: 'ORDER',
    isRead: false,
    link: '/traceability',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  }
];

const getLocalNotifs = () => {
  const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(SEED_NOTIFICATIONS));
    return SEED_NOTIFICATIONS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return SEED_NOTIFICATIONS;
  }
};

const saveLocalNotifs = (list) => {
  localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(list));
};

export const getUserNotifications = async (userId) => {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getUserNotifications fallback:', err);
  }
  const list = getLocalNotifs();
  return list.filter((n) => n.userId === userId || !n.userId);
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
  } catch (err) {
    console.warn('markNotificationAsRead fallback:', err);
  }
  const list = getLocalNotifs().map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
  saveLocalNotifs(list);
  return list;
};

export const markAllNotificationsAsRead = async (userId) => {
  const list = getLocalNotifs().map((n) =>
    n.userId === userId || !n.userId ? { ...n, isRead: true } : n
  );
  saveLocalNotifs(list);
  return list;
};

export const sendNotification = async (notification) => {
  const newNotif = {
    ...notification,
    isRead: false,
    timestamp: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...newNotif,
      createdAt: serverTimestamp(),
    });
    newNotif.id = docRef.id;
  } catch (err) {
    newNotif.id = 'notif_' + Date.now();
  }

  const list = getLocalNotifs();
  saveLocalNotifs([newNotif, ...list]);
  return newNotif;
};
