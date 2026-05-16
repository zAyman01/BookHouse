import { createContext, useState, useCallback, useContext, useEffect, useRef } from 'react';
import useAuth from '../hooks/useAuth';
import * as cartService from '../services/cart.service';

const CartContext = createContext(null);
const CART_KEY = 'bookhouse_cart';

const loadLocal = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

function totalItems(items) {
  return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function subtotal(items) {
  return items.reduce((sum, item) => sum + (item.book?.price || 0) * (item.quantity || 1), 0);
}

export function CartProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const prevUser = useRef(null);

  // Load cart when auth state changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const uid = user?._id;
    const prev = prevUser.current;

    if (!loaded && !uid) {
      setItems(loadLocal());
      setLoaded(true);
      prevUser.current = null;
      return;
    }

    if (uid && uid !== prev) {
      cartService.getCart()
        .then((serverCart) => {
          const guestItems = loadLocal();
          if (guestItems.length > 0 && (!serverCart.items || serverCart.items.length === 0)) {
            return cartService.mergeCart(guestItems).then((merged) => merged.items || []);
          }
          return serverCart.items || [];
        })
        .then((serverItems) => {
          setItems(serverItems);
          localStorage.removeItem(CART_KEY);
        })
        .catch(() => {
          setItems(loadLocal());
        })
        .finally(() => setLoaded(true));
      prevUser.current = uid;
    } else if (!uid && prev) {
      setItems(loadLocal());
      prevUser.current = null;
    } else if (!loaded && uid) {
      cartService.getCart()
        .then((serverCart) => setItems(serverCart.items || []))
        .catch(() => setItems(loadLocal()))
        .finally(() => setLoaded(true));
      prevUser.current = uid;
    }
  }, [user?._id, isAuthenticated, loaded]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const addItem = useCallback(async (book, quantity = 1) => {
    if (isAuthenticated && user) {
      try {
        const cart = await cartService.addToCart(book._id, quantity);
        setItems(cart.items || []);
        return;
      } catch { /* fall through to local */ }
    }
    setItems((prev) => {
      const existing = prev.find((item) => item.book?._id === book._id);
      let next;
      if (existing) {
        next = prev.map((item) =>
          item.book?._id === book._id
            ? { ...item, quantity: (item.quantity || 1) + quantity }
            : item
        );
      } else {
        next = [...prev, { book, quantity }];
      }
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated, user]);

  const removeItem = useCallback(async (bookId) => {
    if (isAuthenticated && user) {
      try {
        const cart = await cartService.removeFromCart(bookId);
        setItems(cart.items || []);
        return;
      } catch { /* fall through */ }
    }
    setItems((prev) => {
      const next = prev.filter((item) => item.book?._id !== bookId);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated, user]);

  const updateQuantity = useCallback(async (bookId, quantity) => {
    if (quantity < 1) return;
    if (isAuthenticated && user) {
      try {
        const cart = await cartService.updateCartItem(bookId, quantity);
        setItems(cart.items || []);
        return;
      } catch { /* fall through */ }
    }
    setItems((prev) => {
      const next = prev.map((item) =>
        item.book?._id === bookId ? { ...item, quantity } : item
      );
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, [isAuthenticated, user]);

  const clearCartItems = useCallback(async () => {
    if (isAuthenticated && user) {
      try { await cartService.clearCart(); } catch { /* ignore */ }
    }
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, [isAuthenticated, user]);

  const count = totalItems(items);
  const sub = subtotal(items);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart: clearCartItems, totalItems: count, subtotal: sub }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
