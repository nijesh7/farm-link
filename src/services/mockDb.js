import { getCategoryImage, getProductImage } from '../data/categoryImages';

// Mock Initial Products
const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    farmerId: 'farmer1',
    farmerName: 'Farmer John Doe',
    name: 'Organic Sweet Strawberries',
    description: 'Freshly picked, sweet organic strawberries grown without any synthetic pesticides. Perfect for snacking, desserts, or smoothies.',
    category: 'Fruits',
    price: 120,
    unit: '500g box',
    quantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    farmerId: 'farmer1',
    farmerName: 'Farmer John Doe',
    name: 'Fresh Crisp Spinach',
    description: 'Crisp, nutrient-rich spinach leaves harvested daily. Great for salads, cooking, or morning green juices.',
    category: 'Leafy Greens',
    price: 25,
    unit: 'bunch',
    quantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    farmerId: 'farmer1',
    farmerName: 'Farmer John Doe',
    name: 'Farm Fresh Organic Eggs',
    description: 'Free-range, organic brown eggs from pasture-raised chickens. Large size and rich, golden yolks.',
    category: 'Dairy',
    price: 80,
    unit: 'dozen',
    quantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1516448626880-186164b3f147?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_4',
    farmerId: 'farmer2',
    farmerName: 'Farmer Sarah Croft',
    name: 'Whole Grain Heirloom Wheat',
    description: 'Stoneground whole grain wheat flour made from organic heritage grains. Enhances texture and nutrition of bread.',
    category: 'Grains',
    price: 260,
    unit: 'bag (5kg)',
    quantity: 15,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_5',
    farmerId: 'farmer2',
    farmerName: 'Farmer Sarah Croft',
    name: 'Red Kidney Beans (Pulses)',
    description: 'Premium dried organic red kidney beans. High protein content, ideal for chilis, stews, and side dishes.',
    category: 'Pulses',
    price: 110,
    unit: 'kg',
    quantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1585998084226-7604ed77e43e?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_6',
    farmerId: 'farmer1',
    farmerName: 'Farmer John Doe',
    name: 'Vine-Ripened Heirloom Tomatoes',
    description: 'Sweet, juicy heirloom tomatoes displaying rich, deep colors. Outstanding flavor for salads or sauces.',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    quantity: 25,
    imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&q=80&w=600',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ord_1',
    customerId: 'customer1',
    customerName: 'Jane Smith',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2
      },
      {
        product: INITIAL_PRODUCTS[2],
        quantity: 1
      }
    ],
    totalAmount: 320,
    deliveryAddress: 'Flat 402, Green Meadows Residency, Indiranagar, Bangalore',
    phone: '+91 98765 43210',
    status: 'In Transit',
    estimatedDeliveryDate: new Date(Date.now() + 86400000 * 1).toISOString(), // Tomorrow
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

export const getProducts = () => {
  const saved = localStorage.getItem('farmlink_products');
  if (!saved) {
    localStorage.setItem('farmlink_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    const parsed = JSON.parse(saved);
    if (parsed.length > 0 && parsed[0].price < 10) {
      localStorage.setItem('farmlink_products', JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return parsed.map((product) => ({ ...product, imageUrl: getProductImage(product) }));
  } catch (e) {
    localStorage.setItem('farmlink_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
};

export const getProductById = (id) => {
  const products = getProducts();
  return products.find((p) => p.id === id);
};

export const saveProduct = (productData, farmer) => {
  const products = getProducts();
  let updatedProducts;

  if (productData.id) {
    // Edit Mode
    updatedProducts = products.map((p) => {
      if (p.id === productData.id) {
        if (p.farmerId !== farmer.uid) throw new Error('Unauthorized');
        return {
          ...p,
          ...productData,
          price: parseFloat(productData.price),
          quantity: parseInt(productData.quantity),
          imageUrl: getCategoryImage(productData.category),
        };
      }
      return p;
    });
  } else {
    // Add Mode
    const newProduct = {
      id: 'prod_' + Date.now(),
      farmerId: farmer.uid,
      farmerName: farmer.name,
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      unit: productData.unit,
      quantity: parseInt(productData.quantity),
      imageUrl: getCategoryImage(productData.category),
      createdAt: new Date().toISOString()
    };
    updatedProducts = [newProduct, ...products];
  }

  localStorage.setItem('farmlink_products', JSON.stringify(updatedProducts));
  return updatedProducts;
};

export const deleteProduct = (id, farmerId) => {
  const products = getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error('Product not found');
  if (product.farmerId !== farmerId) throw new Error('Unauthorized');

  const updatedProducts = products.filter((p) => p.id !== id);
  localStorage.setItem('farmlink_products', JSON.stringify(updatedProducts));
  return updatedProducts;
};

export const getOrders = () => {
  const saved = localStorage.getItem('farmlink_orders');
  if (!saved) {
    localStorage.setItem('farmlink_orders', JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  return JSON.parse(saved);
};

export const createOrder = (orderData) => {
  const orders = getOrders();
  const newOrder = {
    id: 'ord_' + Date.now(),
    customerId: orderData.customerId,
    customerName: orderData.customerName,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    deliveryAddress: orderData.deliveryAddress,
    phone: orderData.phone,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem('farmlink_orders', JSON.stringify(updatedOrders));

  // Deduct products quantity
  const products = getProducts();
  const updatedProducts = products.map((p) => {
    const item = orderData.items.find((i) => i.product.id === p.id);
    if (item) {
      return {
        ...p,
        quantity: Math.max(0, p.quantity - item.quantity)
      };
    }
    return p;
  });
  localStorage.setItem('farmlink_products', JSON.stringify(updatedProducts));

  return newOrder;
};

export const updateOrderStatus = (orderId, newStatus, farmerId) => {
  const orders = getOrders();
  const updatedOrders = orders.map((order) => {
    if (order.id === orderId) {
      // Check if this farmer owns at least one item in the order
      const hasFarmerItem = order.items.some((item) => item.product.farmerId === farmerId);
      if (!hasFarmerItem) throw new Error('Unauthorized');
      
      return {
        ...order,
        status: newStatus
      };
    }
    return order;
  });

  localStorage.setItem('farmlink_orders', JSON.stringify(updatedOrders));
  return updatedOrders;
};
