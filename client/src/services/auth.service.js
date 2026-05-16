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

export const updateProfile = async (updates) => {
  const { data } = await api.put('/auth/profile', updates);
  return data.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put('/auth/password', { currentPassword, newPassword });
  return data.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.put('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data.data;
};

export const verifyOtp = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const { data } = await api.post('/auth/reset-password', { email, otp, newPassword });
  return data.data;
};

export const deleteAccount = async () => {
  const { data } = await api.delete('/auth/account');
  return data.data;
};
