import api from './api';

export const validateCoupon = async (code) => {
  const { data } = await api.post('/coupons/validate', { code });
  return data.data;
};
