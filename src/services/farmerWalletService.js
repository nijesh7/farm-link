import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STORAGE_KEY_WALLETS = 'farmlink_farmer_wallets';
const STORAGE_KEY_TX = 'farmlink_farmer_transactions';

const SEED_TRANSACTIONS = [
  {
    id: 'tx_001',
    farmerId: 'demo_farmer_001',
    orderId: 'ord_1',
    date: '2026-09-29',
    productName: 'Organic Sweet Strawberries (45 lbs)',
    orderAmount: 11205,
    commissionRate: 0.06,
    commissionAmount: 672.30,
    farmerPayout: 10532.70,
    status: 'PAID', // 'PENDING', 'PROCESSING', 'PAID', 'FAILED'
    reference: 'FL-SETTLE-88910',
    createdAt: '2026-09-29T11:20:00Z'
  },
  {
    id: 'tx_002',
    farmerId: 'demo_farmer_001',
    orderId: 'ord_2',
    date: '2026-10-02',
    productName: 'Crisp Baby Spinach (30 bunches)',
    orderAmount: 2370,
    commissionRate: 0.06,
    commissionAmount: 142.20,
    farmerPayout: 2227.80,
    status: 'PAID',
    reference: 'FL-SETTLE-88944',
    createdAt: '2026-10-02T14:15:00Z'
  },
  {
    id: 'tx_003',
    farmerId: 'demo_farmer_001',
    orderId: 'ord_3',
    date: '2026-10-04',
    productName: 'Heirloom Vine Tomatoes (60 lbs)',
    orderAmount: 5940,
    commissionRate: 0.06,
    commissionAmount: 356.40,
    farmerPayout: 5583.60,
    status: 'PROCESSING',
    reference: 'FL-SETTLE-89012',
    createdAt: '2026-10-04T09:00:00Z'
  }
];

const getLocalTx = () => {
  const saved = localStorage.getItem(STORAGE_KEY_TX);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(SEED_TRANSACTIONS));
    return SEED_TRANSACTIONS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return SEED_TRANSACTIONS;
  }
};

const saveLocalTx = (txList) => {
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txList));
};

export const getFarmerTransactions = async (farmerId) => {
  try {
    const q = query(collection(db, 'farmer_transactions'), where('farmerId', '==', farmerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('getFarmerTransactions fallback:', err);
  }
  const list = getLocalTx();
  return list.filter((t) => t.farmerId === farmerId);
};

export const getFarmerWallet = async (farmerId, orders = []) => {
  const transactions = await getFarmerTransactions(farmerId);
  
  const totalPaid = transactions
    .filter((t) => t.status === 'PAID')
    .reduce((sum, t) => sum + t.farmerPayout, 0);

  const pendingPayout = transactions
    .filter((t) => t.status === 'PROCESSING' || t.status === 'PENDING')
    .reduce((sum, t) => sum + t.farmerPayout, 0);

  const totalLifetimeEarnings = transactions.reduce((sum, t) => sum + t.farmerPayout, 0);
  const availableBalance = totalPaid;

  return {
    farmerId,
    availableBalance,
    pendingPayout,
    totalEarnings: totalLifetimeEarnings,
    completedOrdersCount: transactions.filter((t) => t.status === 'PAID').length,
    transactions,
  };
};

export const requestFarmerPayout = async (farmerId, amount, paymentDetails) => {
  const newTx = {
    id: 'tx_req_' + Date.now(),
    farmerId,
    orderId: 'PAYOUT-REQ-' + Date.now().toString().slice(-6),
    date: new Date().toISOString().split('T')[0],
    productName: 'Farmer Wallet Balance Settlement Withdrawal',
    orderAmount: parseFloat(amount),
    commissionRate: 0.0,
    commissionAmount: 0.0,
    farmerPayout: parseFloat(amount),
    status: 'PROCESSING',
    reference: 'FL-PAYOUT-REQ-' + Math.floor(100000 + Math.random() * 900000),
    paymentDetails: paymentDetails || 'Bank / UPI Settlement Workflow',
    createdAt: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'farmer_transactions'), {
      ...newTx,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('requestFarmerPayout fallback:', err);
  }

  const list = getLocalTx();
  saveLocalTx([newTx, ...list]);
  return newTx;
};
