import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { SEED_PRODUCTS } from '../data/seedProducts';
import { getCategoryImage, getProductImage } from '../data/categoryImages';

const toPlainDate = (value) => {
  if (!value) return null;
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
};

const mapDoc = (docSnap) => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    imageUrl: getProductImage(data),
    createdAt: toPlainDate(data.createdAt),
  };
};

const seedProducts = async () => {
  const batch = SEED_PRODUCTS.map((product) =>
    addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
    })
  );
  await Promise.all(batch);
};

export const getProducts = async () => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);

    if (snap.empty) {
      await seedProducts();
      const snap2 = await getDocs(q);
      return snap2.docs.map(mapDoc);
    }

    return snap.docs.map(mapDoc);
  } catch (err) {
    console.warn('getProducts Firestore fallback to seed:', err);
    return SEED_PRODUCTS.map((product, idx) => ({
      id: 'prod_' + (idx + 1),
      ...product,
      imageUrl: getProductImage(product),
      createdAt: new Date().toISOString(),
    }));
  }
};

export const getFarmerProducts = async (farmerId) => {
  try {
    const q = query(collection(db, 'products'), where('farmerId', '==', farmerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(mapDoc)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('getFarmerProducts error:', err);
    throw err;
  }
};

export const saveProduct = async (productData, farmer) => {
  try {
    if (productData.id) {
      const ref = doc(db, 'products', productData.id);
      await updateDoc(ref, {
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: parseFloat(productData.price),
        unit: productData.unit,
        quantity: parseInt(productData.quantity),
        imageUrl: getCategoryImage(productData.category),
      });
      return productData.id;
    }

    const docRef = await addDoc(collection(db, 'products'), {
      farmerId: farmer.uid,
      farmerName: farmer.name,
      name: productData.name,
      description: productData.description,
      category: productData.category,
      price: parseFloat(productData.price),
      unit: productData.unit,
      quantity: parseInt(productData.quantity),
      imageUrl: getCategoryImage(productData.category),
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (err) {
    console.error('saveProduct error:', err);
    throw err;
  }
};

export const deleteProduct = async (productId, farmerId) => {
  try {
    const docRef = doc(db, 'products', productId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Product not found');
    if (snap.data().farmerId !== farmerId) throw new Error('Unauthorized');
    await deleteDoc(docRef);
  } catch (err) {
    console.error('deleteProduct error:', err);
    throw err;
  }
};

export const createOrder = async (orderData) => {
  try {
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 1); // Prompt next-day delivery
    const farmerIds = [...new Set(orderData.items
      .map((item) => item.product?.farmerId)
      .filter(Boolean))];

    if (farmerIds.length === 0) {
      throw new Error('Your cart does not contain valid farmer products.');
    }

    const docRef = await addDoc(collection(db, 'orders'), {
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      phone: orderData.phone,
      farmerIds,
      status: 'Pending',
      estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      createdAt: serverTimestamp(),
    });

    return {
      id: docRef.id,
      ...orderData,
      status: 'Pending',
      estimatedDeliveryDate: estimatedDeliveryDate.toISOString(),
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('createOrder error:', err);
    throw err;
  }
};

export const cancelCustomerOrder = async (orderId, customerId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error('Order not found');
    if (orderSnap.data().customerId !== customerId) throw new Error('Unauthorized');
    if (orderSnap.data().status !== 'Pending') {
      throw new Error('Only pending orders can be cancelled');
    }
    await updateDoc(orderRef, { status: 'Cancelled' });
  } catch (err) {
    console.error('cancelCustomerOrder error:', err);
    throw err;
  }
};

export const getCustomerOrders = async (customerId) => {
  try {
    const q = query(collection(db, 'orders'), where('customerId', '==', customerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(mapDoc)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('getCustomerOrders error:', err);
    throw err;
  }
};

export const getFarmerOrders = async (farmerId) => {
  try {
    const q = query(collection(db, 'orders'), where('farmerIds', 'array-contains', farmerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(mapDoc)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error('getFarmerOrders error:', err);
    throw err;
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    throw err;
  }
};

/* ── ADMIN MANAGEMENT SERVICES ── */
export const getAllOrders = async () => {
  try {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(mapDoc);
  } catch (err) {
    console.error('getAllOrders error:', err);
    return [];
  }
};

export const getAllUsers = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  } catch (err) {
    console.error('getAllUsers error:', err);
    return [];
  }
};

export const adminDeleteProduct = async (productId) => {
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('adminDeleteProduct error:', err);
    throw err;
  }
};

export const adminUpdateUser = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, updates);
  } catch (err) {
    console.error('adminUpdateUser error:', err);
    throw err;
  }
};
