import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartKey = (user) => (
  user?.role === 'customer' ? `farmlink_cart_${user.uid}` : null
);

const readCart = (key) => {
  if (!key) return [];

  try {
    const saved = localStorage.getItem(key);
    const items = saved ? JSON.parse(saved) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const cartKey = getCartKey(currentUser);
  const isHydrating = useRef(true);
  const [cartItems, setCartItems] = useState([]);

  // A cart belongs to one customer account, never to the browser session.
  useEffect(() => {
    isHydrating.current = true;
    setCartItems(readCart(cartKey));
  }, [cartKey]);

  useEffect(() => {
    // Do not overwrite a customer's saved cart before it has been loaded.
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }

    if (cartKey) {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, cartKey]);

  const requireCustomer = () => {
    if (!cartKey) throw new Error('Only customer accounts can use the cart.');
  };

  const addToCart = (product, quantity = 1) => {
    requireCustomer();
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingItemIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingItemIndex].quantity + quantity;
        updated[existingItemIndex].quantity = Math.min(newQty, product.quantity);
        return updated;
      }
      return [...prevItems, { product, quantity: Math.min(quantity, product.quantity) }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    requireCustomer();
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) => prevItems.map((item) => (
      item.product.id === productId
        ? { ...item, quantity: Math.min(newQty, item.product.quantity) }
        : item
    )));
  };

  const removeFromCart = (productId) => {
    requireCustomer();
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    requireCustomer();
    setCartItems([]);
  };

  const getSubtotal = () => cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const getDeliveryCharge = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 50;
  };

  const getTotal = () => getSubtotal() + getDeliveryCharge();

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getSubtotal,
      getDeliveryCharge,
      getTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
