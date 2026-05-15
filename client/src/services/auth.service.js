import api from './api';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};

export const register = async (name, email, password, role) => {
  const { data } = await api.post('/auth/register', { name, email, password, role });
  return data.data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data;
};

export const logout = async () => {
  const { data } = await api.post('/auth/logout');
  return data.data;
};
