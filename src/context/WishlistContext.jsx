import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const getWishlistKey = (user) => (
  user?.role === 'customer' ? `farmlink_wishlist_${user.uid}` : null
);

const readWishlist = (key) => {
  if (!key) return [];
  try {
    const saved = localStorage.getItem(key);
    const products = saved ? JSON.parse(saved) : [];
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
};

export function WishlistProvider({ children }) {
  const { currentUser } = useAuth();
  const wishlistKey = getWishlistKey(currentUser);
  const isHydrating = useRef(true);
  const [savedProducts, setSavedProducts] = useState([]);

  useEffect(() => {
    isHydrating.current = true;
    setSavedProducts(readWishlist(wishlistKey));
  }, [wishlistKey]);

  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (wishlistKey) localStorage.setItem(wishlistKey, JSON.stringify(savedProducts));
  }, [savedProducts, wishlistKey]);

  const toggleSavedProduct = (product) => {
    if (!wishlistKey) throw new Error('Only customer accounts can save products.');
    setSavedProducts((previous) => (
      previous.some((saved) => saved.id === product.id)
        ? previous.filter((saved) => saved.id !== product.id)
        : [...previous, product]
    ));
  };

  const removeSavedProduct = (productId) => {
    if (!wishlistKey) throw new Error('Only customer accounts can save products.');
    setSavedProducts((previous) => previous.filter((product) => product.id !== productId));
  };

  const isSaved = (productId) => savedProducts.some((product) => product.id === productId);

  return (
    <WishlistContext.Provider value={{ savedProducts, toggleSavedProduct, removeSavedProduct, isSaved }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
