import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('farmlink_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('farmlink_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id);
      if (existingItemIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingItemIndex].quantity + quantity;
        // Limit quantity to available stock
        updated[existingItemIndex].quantity = Math.min(newQty, product.quantity);
        return updated;
      }
      return [...prevItems, { product, quantity: Math.min(quantity, product.quantity) }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: Math.min(newQty, item.product.quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const getDeliveryCharge = () => {
    const subtotal = getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal > 40 ? 0 : 5.00; // Free delivery over $40
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCharge();
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getSubtotal,
    getDeliveryCharge,
    getTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
