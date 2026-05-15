import { createContext, useState, useCallback, useContext } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'bookhouse_cart';

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  const saveCart = useCallback((newItems) => {
    setItems(newItems);
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
  }, []);

  const addItem = useCallback((book, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.book._id === book._id);
      if (existing) {
        const next = prev.map((item) =>
          item.book._id === book._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        localStorage.setItem(CART_KEY, JSON.stringify(next));
        return next;
      }
      const next = [...prev, { book, quantity }];
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeItem = useCallback((bookId) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.book._id !== bookId);
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((bookId, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => {
      const next = prev.map((item) =>
        item.book._id === bookId ? { ...item, quantity } : item
      );
      localStorage.setItem(CART_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
