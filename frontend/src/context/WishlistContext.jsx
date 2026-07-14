import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

const WishlistContext = createContext(null);
const GUEST_KEY = 'yo_guest_wishlist';

function loadGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { token, isLoggedIn } = useAuth();
  const [productIds, setProductIds] = useState(loadGuest);
  const [synced, setSynced] = useState(false);

  // Re-sync whenever the logged-in identity changes (login, logout, or
  // switching accounts on the same device) — otherwise `synced` stays true
  // forever after the first login and later sessions keep showing whichever
  // account's wishlist happened to load first.
  useEffect(() => {
    setSynced(false);
    if (!token) setProductIds(loadGuest());
  }, [token]);

  useEffect(() => {
    if (!isLoggedIn || synced) return;
    const guestIds = loadGuest();

    api
      .getWishlist(token)
      .then(async (data) => {
        let merged = data.productIds || [];
        for (const id of guestIds) {
          if (!merged.includes(id)) {
            await api.addWishlist(token, id);
            merged.push(id);
          }
        }
        localStorage.removeItem(GUEST_KEY);
        setProductIds(merged);
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [isLoggedIn, token, synced]);

  const persistGuest = useCallback((ids) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(ids));
  }, []);

  function toggleWishlist(productId) {
    const has = productIds.includes(productId);
    const next = has ? productIds.filter((id) => id !== productId) : [...productIds, productId];
    setProductIds(next);

    if (isLoggedIn && token) {
      if (has) api.removeWishlist(token, productId).catch(() => {});
      else api.addWishlist(token, productId).catch(() => {});
    } else {
      persistGuest(next);
    }
  }

  return (
    <WishlistContext.Provider value={{ productIds, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
