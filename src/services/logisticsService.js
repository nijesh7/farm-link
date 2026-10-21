// Kisan Carpool & Logistics Aggregation Service
// Shared rural transport pooling to slash freight costs for farmers

const STORAGE_KEY = 'farmlink_kisan_carpool_routes';
const BOOKINGS_KEY = 'farmlink_carpool_bookings';

const DEFAULT_ROUTES = [
  {
    id: 'pool-rt-01',
    fromHub: 'Nashik Agro-Cluster (Dindori Hub)',
    toMandi: 'Mumbai APMC Vashi Terminal',
    distanceKm: 165,
    departureTime: 'Today, 08:30 PM',
    truckType: 'Refrigerated 4.5-Ton Van (Cold Chain 4°C)',
    vehicleNumber: 'MH-15-EG-4920',
    driverName: 'Suresh Patil (Verified Partner)',
    driverPhone: '+91 98231 44021',
    driverRating: 4.9,
    totalCapacityKg: 4500,
    bookedCapacityKg: 3200,
    pooledRatePerCrate: 45, // ₹45 per standard 20kg crate
    privateSoloRatePerCrate: 110, // ₹110 solo freight
    allowedCrops: ['Tomatoes', 'Grapes', 'Pomegranates', 'Capsicum', 'Exotics'],
    stops: ['Dindori Hub', 'Pimpalgaon Toll', 'Igatpuri Pickup', 'Thane Bypass', 'Vashi APMC'],
    status: 'BOARDING_SOON',
    temperatureLogged: '4.2°C Stable'
  },
  {
    id: 'pool-rt-02',
    fromHub: 'Pune / Junnar Farming Belt',
    toMandi: 'Bengaluru Yeshwanthpur APMC Hub',
    distanceKm: 840,
    departureTime: 'Tomorrow, 06:00 AM',
    truckType: '10-Ton Eicher Heavy Multi-Axle',
    vehicleNumber: 'MH-12-QX-8812',
    driverName: 'Balaji Jadhav',
    driverPhone: '+91 97654 32189',
    driverRating: 4.8,
    totalCapacityKg: 10000,
    bookedCapacityKg: 7400,
    pooledRatePerCrate: 85,
    privateSoloRatePerCrate: 220,
    allowedCrops: ['Onions', 'Potatoes', 'Sweet Corn', 'Ginger', 'Turmeric'],
    stops: ['Junnar Mandi', 'Pune Hadapsar', 'Satara Phaltan', 'Kolhapur', 'Yeshwanthpur'],
    status: 'ACCEPTING_BOOKINGS',
    temperatureLogged: 'Ambient Dry Canopy'
  },
  {
    id: 'pool-rt-03',
    fromHub: 'Sonipat / Murthal Agro Zone',
    toMandi: 'Delhi Azadpur Wholesale Mandi (Gate 4)',
    distanceKm: 52,
    departureTime: 'Today, 11:00 PM',
    truckType: '3.2-Ton Tata 407 Tarpaulin Covered',
    vehicleNumber: 'HR-10-AZ-1044',
    driverName: 'Hardeep Singh Dhillon',
    driverPhone: '+91 99102 77301',
    driverRating: 5.0,
    totalCapacityKg: 3200,
    bookedCapacityKg: 1800,
    pooledRatePerCrate: 28,
    privateSoloRatePerCrate: 75,
    allowedCrops: ['Spinach', 'Coriander', 'Cauliflower', 'Green Peas', 'Radish'],
    stops: ['Murthal Toll Hub', 'Rai Food Park', 'Kundli Border', 'Azadpur Shed 8'],
    status: 'ACCEPTING_BOOKINGS',
    temperatureLogged: 'Night Ambient Breezy'
  },
  {
    id: 'pool-rt-04',
    fromHub: 'Coimbatore / Pollachi Coconut & Spices',
    toMandi: 'Kochi Maradu Wholesale Fruit Market',
    distanceKm: 190,
    departureTime: 'Tomorrow, 04:30 AM',
    truckType: 'Eco-Electric 5-Ton Cargo Truck',
    vehicleNumber: 'TN-38-EV-9011',
    driverName: 'Karthik Subramanian',
    driverPhone: '+91 94432 18890',
    driverRating: 4.9,
    totalCapacityKg: 5000,
    bookedCapacityKg: 3900,
    pooledRatePerCrate: 55,
    privateSoloRatePerCrate: 135,
    allowedCrops: ['Tender Coconuts', 'Bananas (Nendran)', 'Nutmeg', 'Betel Leaves'],
    stops: ['Pollachi Junction', 'Palakkad Gap', 'Thrissur Round', 'Maradu Market'],
    status: 'FEW_SLOTS_LEFT',
    temperatureLogged: 'Ventilated Eco-EV'
  }
];

export function getCarpoolRoutes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROUTES));
      return DEFAULT_ROUTES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_ROUTES;
  }
}

export function bookCarpoolSpace({ routeId, farmerName, farmerPhone, cropType, cratesCount, pickupPoint }) {
  const routes = getCarpoolRoutes();
  const index = routes.findIndex(r => r.id === routeId);
  if (index === -1) throw new Error('Route not found');

  const route = routes[index];
  const weightKg = cratesCount * 20; // 20kg per standard crate
  const remainingSpace = route.totalCapacityKg - route.bookedCapacityKg;

  if (weightKg > remainingSpace) {
    throw new Error(`Only ${Math.floor(remainingSpace / 20)} crates (${remainingSpace} kg) space remaining in this truck.`);
  }

  // Update booked capacity
  route.bookedCapacityKg += weightKg;
  routes[index] = route;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));

  const totalCost = cratesCount * route.pooledRatePerCrate;
  const soloCost = cratesCount * route.privateSoloRatePerCrate;
  const savedAmount = soloCost - totalCost;

  const booking = {
    bookingId: 'BK-POOL-' + Math.floor(100000 + Math.random() * 900000),
    routeId,
    farmerName,
    farmerPhone,
    cropType,
    cratesCount,
    weightKg,
    pickupPoint,
    routeSummary: `${route.fromHub} → ${route.toMandi}`,
    driverName: route.driverName,
    driverPhone: route.driverPhone,
    departureTime: route.departureTime,
    vehicleNumber: route.vehicleNumber,
    totalCost,
    soloCost,
    savedAmount,
    status: 'CONFIRMED',
    bookedAt: new Date().toISOString()
  };

  try {
    const existingBookings = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    existingBookings.unshift(booking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(existingBookings));
  } catch (e) {
    // fallback
  }

  return booking;
}

export function getUserCarpoolBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function offerNewCarpoolRoute(routeData) {
  const routes = getCarpoolRoutes();
  const newRoute = {
    id: 'pool-custom-' + Date.now(),
    ...routeData,
    status: 'ACCEPTING_BOOKINGS'
  };
  routes.unshift(newRoute);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  return newRoute;
}
