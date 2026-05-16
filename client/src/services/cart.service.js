import api from './api';

export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data.data;
};

export const addToCart = async (bookId, quantity = 1) => {
  const { data } = await api.post('/cart', { bookId, quantity });
  return data.data;
};

export const updateCartItem = async (bookId, quantity) => {
  const { data } = await api.put(`/cart/${bookId}`, { quantity });
  return data.data;
};

export const removeFromCart = async (bookId) => {
  const { data } = await api.delete(`/cart/${bookId}`);
  return data.data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data.data;
};

export const mergeCart = async (items) => {
  const { data } = await api.post('/cart/merge', { items });
  return data.data;
};
