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

const DEMO_ACCOUNTS = {
  'admin@farmlink.com': {
    uid: 'demo_admin_001',
    name: 'Platform SuperAdmin',
    email: 'admin@farmlink.com',
    role: 'admin',
    phone: '+91 99999 88888',
    address: 'FarmLink Central HQ, AgriTech Tower, Bangalore',
  },
  'farmer@farmlink.com': {
    uid: 'demo_farmer_001',
    name: 'Farmer John Doe',
    email: 'farmer@farmlink.com',
    role: 'farmer',
    phone: '+91 98765 43210',
    address: 'Doe Heritage Valley Orchards, Shimla, Himachal Pradesh',
  },
  'customer@farmlink.com': {
    uid: 'demo_customer_001',
    name: 'Jane Smith',
    email: 'customer@farmlink.com',
    role: 'customer',
    phone: '+91 91234 56789',
    address: '45 Green Meadow Lane, Metropolis, New Delhi',
  },
  'buyer@farmlink.com': {
    uid: 'demo_buyer_001',
    name: 'Grand Heritage Hotel & Bistro',
    email: 'buyer@farmlink.com',
    role: 'buyer',
    phone: '+91 98888 77777',
    address: 'Madurai Central Kitchen, Ring Road, Tamil Nadu',
  },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('farmlink_auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  /* Listen for Firebase auth state changes */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser(profile);
          localStorage.setItem('farmlink_auth_user', JSON.stringify(profile));
        }
      } else {
        const localSaved = localStorage.getItem('farmlink_auth_user');
        if (localSaved) {
          try {
            const parsed = JSON.parse(localSaved);
            if (parsed?.uid) {
              setCurrentUser(parsed);
            } else {
              setCurrentUser(null);
            }
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
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
      console.warn('fetchUserProfile notice:', err);
      return null;
    }
  };

  /* ── LOGIN ── */
  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check built-in demo accounts
    if (DEMO_ACCOUNTS[cleanEmail]) {
      const demoUser = DEMO_ACCOUNTS[cleanEmail];
      setCurrentUser(demoUser);
      localStorage.setItem('farmlink_auth_user', JSON.stringify(demoUser));
      return demoUser;
    }

    // 2. Check local registered accounts
    const localUsers = JSON.parse(localStorage.getItem('farmlink_registered_users') || '[]');
    const matched = localUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );
    if (matched) {
      const profile = {
        uid: matched.uid,
        name: matched.name,
        email: matched.email,
        role: matched.role || 'customer',
        phone: matched.phone,
        address: matched.address,
      };
      setCurrentUser(profile);
      localStorage.setItem('farmlink_auth_user', JSON.stringify(profile));
      return profile;
    }

    // 3. Try Firebase Auth
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await fetchUserProfile(credential.user.uid);
      const userObj = profile || {
        uid: credential.user.uid,
        email: cleanEmail,
        role: 'customer',
        name: cleanEmail.split('@')[0],
      };
      setCurrentUser(userObj);
      localStorage.setItem('farmlink_auth_user', JSON.stringify(userObj));
      return userObj;
    } catch (err) {
      // If user exists locally with different password, show specific error
      const userExists = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
      if (userExists) {
        throw new Error('Incorrect password. Please verify your credentials.');
      }
      throw err;
    }
  };

  /* ── REGISTER ── */
  const register = async (userData) => {
    const role = userData.role || 'customer';
    const cleanEmail = userData.email.trim().toLowerCase();

    try {
      let uid;
      try {
        const credential = await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          userData.password
        );
        uid = credential.user.uid;
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          // If already in use, attempt password verification / login
          const localUsers = JSON.parse(localStorage.getItem('farmlink_registered_users') || '[]');
          const matched = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
          if (matched && matched.password === userData.password) {
            const profile = {
              uid: matched.uid,
              name: matched.name,
              email: matched.email,
              role: matched.role,
              phone: matched.phone,
              address: matched.address,
            };
            setCurrentUser(profile);
            localStorage.setItem('farmlink_auth_user', JSON.stringify(profile));
            return profile;
          }
          throw new Error('This email address is already in use. Please sign in or use another email.');
        }
        // Fallback UID if network / Firebase Auth is unreachable
        uid = 'usr_' + Date.now();
      }

      const newProfile = {
        uid,
        name: userData.name,
        email: cleanEmail,
        phone: userData.phone,
        address: userData.address,
        role,
        createdAt: new Date().toISOString(),
      };

      // Try persisting to Firestore users collection
      try {
        await setDoc(doc(db, 'users', uid), {
          name: userData.name,
          email: cleanEmail,
          phone: userData.phone,
          address: userData.address,
          role,
          createdAt: serverTimestamp(),
        });
      } catch (storeErr) {
        console.warn('Firestore setDoc notice:', storeErr);
      }

      // Store in local accounts list
      const localUsers = JSON.parse(localStorage.getItem('farmlink_registered_users') || '[]');
      const existingIdx = localUsers.findIndex((u) => u.email.toLowerCase() === cleanEmail);
      if (existingIdx >= 0) {
        localUsers[existingIdx] = { ...newProfile, password: userData.password };
      } else {
        localUsers.push({ ...newProfile, password: userData.password });
      }
      localStorage.setItem('farmlink_registered_users', JSON.stringify(localUsers));

      setCurrentUser(newProfile);
      localStorage.setItem('farmlink_auth_user', JSON.stringify(newProfile));
      return newProfile;
    } catch (err) {
      console.error('Registration error:', err);
      throw err;
    }
  };

  /* ── LOGOUT ── */
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('SignOut warning:', err);
    }
    setCurrentUser(null);
    localStorage.removeItem('farmlink_auth_user');
  };

  /* ── UPDATE PROFILE ── */
  const updateProfile = async (updatedData) => {
    if (!currentUser) throw new Error('Not authenticated');
    const updates = {
      name: updatedData.name,
      phone: updatedData.phone,
      address: updatedData.address,
    };

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), updates);
    } catch (err) {
      console.warn('Firestore update warning:', err);
    }

    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    localStorage.setItem('farmlink_auth_user', JSON.stringify(updated));
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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
