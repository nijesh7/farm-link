// Krishi Machinery & Drone Rental Service ("Uber for Tractors & Harvesters")
// Peer-to-peer equipment sharing to empower smallholder farmers

const STORAGE_KEY = 'farmlink_equipment_catalog';
const RENTALS_KEY = 'farmlink_equipment_rentals';

const DEFAULT_EQUIPMENT = [
  {
    id: 'eq-01',
    name: 'Mahindra 575 DI Sarpanch 45HP Tractor',
    category: 'Tractors & Heavy Machinery',
    subCategory: 'Tractor',
    ownerName: 'Rameshwar Patil',
    ownerLocation: 'Dindori, Nashik (4.2 km away)',
    phone: '+91 98220 11982',
    rating: 4.9,
    completedJobs: 84,
    imageUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
    ratePerHour: 650,
    ratePerAcre: 900,
    minRentalHours: 2,
    operatorIncluded: true,
    fuelPolicy: 'Includes Diesel & Certified Driver',
    features: ['Power Steering', 'Dual Clutch', 'Reversible Plough Attachment Included', 'Night LED Work Lights'],
    availability: 'Available Today',
    isInstantBook: true
  },
  {
    id: 'eq-02',
    name: 'DJI Agras T40 Agricultural Spraying Drone',
    category: 'Precision Agri Tech',
    subCategory: 'Drone Sprayer',
    ownerName: 'GreenTech Agri-Flyers Club',
    ownerLocation: 'Baramati Tech Hub (8.5 km away)',
    phone: '+91 91580 44321',
    rating: 5.0,
    completedJobs: 132,
    imageUrl: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80',
    ratePerHour: 1200,
    ratePerAcre: 450, // Ultra-fast: sprays 1 acre in 6 minutes!
    minRentalHours: 1,
    operatorIncluded: true,
    fuelPolicy: 'DGCA Certified Drone Pilot Included + Extra Batteries',
    features: ['40L Spray Tank', 'Centrifugal Atomization Nozzles', 'Omnidirectional Obstacle Avoidance', 'Centimeter-Level RTK GPS'],
    availability: 'Available Tomorrow Morning',
    isInstantBook: true
  },
  {
    id: 'eq-03',
    name: 'Shaktiman 7-Feet Heavy Duty Rotavator',
    category: 'Implements & Tillage',
    subCategory: 'Rotary Tiller',
    ownerName: 'Gurpreet Singh',
    ownerLocation: 'Karnal Agro Ring (6.0 km away)',
    phone: '+91 98120 77654',
    rating: 4.8,
    completedJobs: 56,
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
    ratePerHour: 400,
    ratePerAcre: 750,
    minRentalHours: 3,
    operatorIncluded: false,
    fuelPolicy: 'Attachment Only (Requires 45+ HP 3-point hitch tractor)',
    features: ['Boron Steel L-Blades', 'Oil Bath Multi-Speed Gearbox', 'Heavy Depth Skid Shoes', 'Adjustable Rear Trailing Board'],
    availability: 'Available Now',
    isInstantBook: false
  },
  {
    id: 'eq-04',
    name: 'Preet 987 Self-Propelled Multi-Crop Combine Harvester',
    category: 'Tractors & Heavy Machinery',
    subCategory: 'Combine Harvester',
    ownerName: 'Balwinder Sandhu',
    ownerLocation: 'Ambala Ring (14 km away)',
    phone: '+91 99960 33412',
    rating: 4.9,
    completedJobs: 92,
    imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    ratePerHour: 2200,
    ratePerAcre: 1800,
    minRentalHours: 4,
    operatorIncluded: true,
    fuelPolicy: 'Includes 2 Crew Operators + Diesel',
    features: ['14-Feet Cutter Bar', 'Dual Straw Walker', 'Cereal & Grain Header', 'GPS Acreage Counter'],
    availability: 'Slots Open from Thursday',
    isInstantBook: true
  },
  {
    id: 'eq-05',
    name: 'Spectra Precision Laser Land Leveler',
    category: 'Precision Agri Tech',
    subCategory: 'Laser Leveler',
    ownerName: 'Kisan Samridhi Center',
    ownerLocation: 'Hisar Road (9.2 km away)',
    phone: '+91 94160 55901',
    rating: 4.85,
    completedJobs: 67,
    imageUrl: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80',
    ratePerHour: 800,
    ratePerAcre: 1100,
    minRentalHours: 3,
    operatorIncluded: true,
    fuelPolicy: 'Includes Laser Transmitter, Bucket & Technician',
    features: ['Saves 30% Irrigation Water', 'Increases Crop Stand Uniformity', '360° Laser Sensor', 'Hydraulic Mast Control'],
    availability: 'Available Today',
    isInstantBook: true
  }
];

export function getEquipmentCatalog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EQUIPMENT));
      return DEFAULT_EQUIPMENT;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_EQUIPMENT;
  }
}

export function bookEquipment({ equipmentId, farmerName, farmerPhone, villageAddress, rentalType, quantity, bookingDate }) {
  const catalog = getEquipmentCatalog();
  const machine = catalog.find(m => m.id === equipmentId);
  if (!machine) throw new Error('Equipment not found');

  const unitRate = rentalType === 'ACRE' ? machine.ratePerAcre : machine.ratePerHour;
  const basePrice = unitRate * quantity;
  const insuranceDeposit = 500; // Refundable security deposit
  const totalAmount = basePrice + insuranceDeposit;

  const booking = {
    bookingId: 'EQ-RES-' + Math.floor(100000 + Math.random() * 900000),
    equipmentId,
    machineName: machine.name,
    machineCategory: machine.category,
    ownerName: machine.ownerName,
    ownerPhone: machine.phone,
    farmerName,
    farmerPhone,
    villageAddress,
    rentalType, // 'ACRE' or 'HOUR'
    quantity,
    bookingDate,
    unitRate,
    basePrice,
    insuranceDeposit,
    totalAmount,
    operatorStatus: machine.operatorIncluded ? 'Operator Included' : 'Self-Operated',
    status: 'BOOKED_CONFIRMED',
    bookedAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');
    existing.unshift(booking);
    localStorage.setItem(RENTALS_KEY, JSON.stringify(existing));
  } catch (e) {
    // fallback
  }

  return booking;
}

export function getUserEquipmentBookings() {
  try {
    return JSON.parse(localStorage.getItem(RENTALS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function listNewEquipment(equipmentData) {
  const catalog = getEquipmentCatalog();
  const newMachine = {
    id: 'eq-custom-' + Date.now(),
    ...equipmentData,
    rating: 5.0,
    completedJobs: 0,
    availability: 'Available Now'
  };
  catalog.unshift(newMachine);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  return newMachine;
}
