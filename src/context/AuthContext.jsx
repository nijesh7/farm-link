import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while Firebase resolves session

  /* Listen for Firebase auth state changes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch profile from Firestore
        const profile = await fetchUserProfile(firebaseUser.uid);
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return { uid, ...snap.data() };
      }
      return null;
    } catch (err) {
      console.error('fetchUserProfile error:', err);
      return null;
    }
  };

  /* ── LOGIN ── */
  const login = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile = await fetchUserProfile(credential.user.uid);
    setCurrentUser(profile);
    return profile;
  };

  /* ── REGISTER ── */
  const register = async (userData) => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const newProfile = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address,
      role: userData.role,
      createdAt: serverTimestamp(),
    };

    // Save profile in Firestore users/{uid}
    await setDoc(doc(db, 'users', credential.user.uid), newProfile);

    const fullProfile = { uid: credential.user.uid, ...newProfile };
    setCurrentUser(fullProfile);
    return fullProfile;
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  /* ── UPDATE PROFILE ── */
  const updateProfile = async (updatedData) => {
    if (!currentUser) throw new Error('Not authenticated');
    const updates = {
      name: updatedData.name,
      phone: updatedData.phone,
      address: updatedData.address,
    };
    await updateDoc(doc(db, 'users', currentUser.uid), updates);
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    return updated;
  };

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {/* Don't render children until Firebase resolves initial auth state */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
