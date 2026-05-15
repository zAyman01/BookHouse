import api from './api';

export const placeOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data.data;
};

export const getMyOrders = async (params = {}) => {
  const { data } = await api.get('/orders/my', { params });
  return data.data;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
};
