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
    console.error('getProducts error:', err);
    throw err;
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
      imageUrl:
        productData.imageUrl ||
        'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600',
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
    const docRef = await addDoc(collection(db, 'orders'), {
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      phone: orderData.phone,
      status: 'Pending',
      createdAt: serverTimestamp(),
    });

    const updates = orderData.items.map(async (item) => {
      const pRef = doc(db, 'products', item.product.id);
      const pSnap = await getDoc(pRef);
      if (pSnap.exists()) {
        const newQty = Math.max(0, pSnap.data().quantity - item.quantity);
        await updateDoc(pRef, { quantity: newQty });
      }
    });
    await Promise.all(updates);

    return { id: docRef.id, ...orderData, status: 'Pending', createdAt: new Date().toISOString() };
  } catch (err) {
    console.error('createOrder error:', err);
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
    const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
    const allOrders = snap.docs.map(mapDoc);
    return allOrders.filter((order) =>
      order.items?.some((item) => item.product?.farmerId === farmerId)
    );
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
