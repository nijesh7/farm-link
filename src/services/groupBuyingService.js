// Community & Apartment Group Buying Service ("Farm-to-Club")
// Direct farm-to-apartment collective pooling to unlock bulk wholesale prices

const STORAGE_KEY = 'farmlink_community_group_pools';
const ORDERS_KEY = 'farmlink_group_orders';

const DEFAULT_POOLS = [
  {
    id: 'grp-pool-01',
    communityName: 'Greenfield Palm Residency & Towers',
    locality: 'Whitefield / ITPL Corridor, Bengaluru',
    coordinatorName: 'Priya Sharma (Block B Secretary)',
    poolTitle: 'Direct Ratnagiri Organic Alphonso Mangoes Harvest Batch',
    farmerName: 'Vikas Rao (Ratnagiri Orchards)',
    farmerLocation: 'Pawapuri Farm, Ratnagiri (GI-Tagged)',
    targetKg: 150,
    currentKg: 118,
    retailPricePerKg: 420,
    wholesalePricePerKg: 285, // 32% discount!
    minOrderKg: 3,
    deadlineHoursLeft: 14,
    freeDeliveryThresholdReached: true,
    membersJoined: 26,
    imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
    description: 'Naturally ripened carbide-free GI-certified Alphonso mangoes picked directly from tree canopies. Delivered in padded cartons directly to Club House on Saturday.',
    status: 'ACTIVE_CLOSING_SOON'
  },
  {
    id: 'grp-pool-02',
    communityName: 'CyberPark Tech Residences',
    locality: 'Hitec City / Gachibowli, Hyderabad',
    coordinatorName: 'Raghavendra Varma',
    poolTitle: 'Zero-Residue Hydroponic Salad Greens & Exotic Veggies',
    farmerName: 'Sunil Reddy (AgriTech Greenhouses)',
    farmerLocation: 'Chevella Valley Farms',
    targetKg: 80,
    currentKg: 64,
    retailPricePerKg: 190,
    wholesalePricePerKg: 125, // 34% discount!
    minOrderKg: 2,
    deadlineHoursLeft: 22,
    freeDeliveryThresholdReached: true,
    membersJoined: 19,
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp Butterhead Lettuce, English Cucumbers, Cherry Tomatoes, and Baby Spinach harvested same-morning at 5 AM. Zero chemical pesticides.',
    status: 'ACTIVE'
  },
  {
    id: 'grp-pool-03',
    communityName: 'Lodha Palava Lakeshore Society',
    locality: 'Dombivli / Kalyan, Mumbai MMR',
    coordinatorName: 'Anand Deshmukh',
    poolTitle: 'Direct Farmer Red Onions & Farm Potatoes (Winter Lot)',
    farmerName: 'Dnyaneshwar Shinde (Lasalgaon Mandi Farmer)',
    farmerLocation: 'Lasalgaon Belt, Nashik',
    targetKg: 300,
    currentKg: 280,
    retailPricePerKg: 45,
    wholesalePricePerKg: 26, // 42% discount!
    minOrderKg: 10,
    deadlineHoursLeft: 8,
    freeDeliveryThresholdReached: true,
    membersJoined: 42,
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
    description: 'Export-grade dry-cured red onions and Agra potatoes. Bulk sacks delivered right to tower lobbies with zero middleman markup.',
    status: 'ALMOST_FULL'
  }
];

export function getGroupBuyingPools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POOLS));
      return DEFAULT_POOLS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_POOLS;
  }
}

export function joinGroupPool({ poolId, buyerName, buyerPhone, apartmentNumber, quantityKg }) {
  const pools = getGroupBuyingPools();
  const index = pools.findIndex(p => p.id === poolId);
  if (index === -1) throw new Error('Community pool not found');

  const pool = pools[index];
  pool.currentKg += Number(quantityKg);
  pool.membersJoined += 1;
  pools[index] = pool;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));

  const totalAmount = pool.wholesalePricePerKg * quantityKg;
  const standardRetailAmount = pool.retailPricePerKg * quantityKg;
  const userSavings = standardRetailAmount - totalAmount;

  const order = {
    orderId: 'GRP-ORD-' + Math.floor(100000 + Math.random() * 900000),
    poolId,
    poolTitle: pool.poolTitle,
    communityName: pool.communityName,
    buyerName,
    buyerPhone,
    apartmentNumber,
    quantityKg: Number(quantityKg),
    wholesaleRate: pool.wholesalePricePerKg,
    totalAmount,
    userSavings,
    status: 'CONFIRMED_IN_POOL',
    orderDate: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    existing.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(existing));
  } catch (e) {
    // fallback
  }

  return order;
}

export function getUserGroupOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function createNewCommunityPool(poolData) {
  const pools = getGroupBuyingPools();
  const newPool = {
    id: 'grp-custom-' + Date.now(),
    ...poolData,
    currentKg: 0,
    membersJoined: 1,
    freeDeliveryThresholdReached: false,
    status: 'ACTIVE'
  };
  pools.unshift(newPool);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pools));
  return newPool;
}
