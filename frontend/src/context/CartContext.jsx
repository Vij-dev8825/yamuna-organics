import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../api';

const CartContext = createContext(null);
const GUEST_KEY = 'yo_guest_cart';

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { token, isLoggedIn } = useAuth();
  const [items, setItems] = useState(loadGuestCart);
  const [synced, setSynced] = useState(false);

  // On login: merge guest cart into server cart once.
  useEffect(() => {
    if (!isLoggedIn || synced) return;

    const guestItems = loadGuestCart();

    api
      .getCart(token)
      .then(async (data) => {
        let merged = data.items || [];
        if (guestItems.length) {
          guestItems.forEach((g) => {
            const existing = merged.find((m) => m.productId === g.productId && m.size === g.size);
            if (existing) existing.quantity += g.quantity;
            else merged.push(g);
          });
          await api.syncCart(token, merged);
          localStorage.removeItem(GUEST_KEY);
        }
        setItems(merged);
        setSynced(true);
      })
      .catch(() => setSynced(true));
  }, [isLoggedIn, token, synced]);

  const persist = useCallback(
    (newItems) => {
      setItems(newItems);
      if (isLoggedIn && token) {
        api.syncCart(token, newItems).catch(() => {});
      } else {
        localStorage.setItem(GUEST_KEY, JSON.stringify(newItems));
      }
    },
    [isLoggedIn, token]
  );

  function addItem(productId, size, quantity = 1) {
    const existing = items.find((i) => i.productId === productId && i.size === size);
    let next;
    if (existing) {
      next = items.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      next = [...items, { productId, size, quantity }];
    }
    persist(next);
  }

  function updateQuantity(productId, size, quantity) {
    const next = items
      .map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
      .filter((i) => i.quantity > 0);
    persist(next);
  }

  function removeItem(productId, size) {
    persist(items.filter((i) => !(i.productId === productId && i.size === size)));
  }

  function clearCart() {
    persist([]);
  }

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
