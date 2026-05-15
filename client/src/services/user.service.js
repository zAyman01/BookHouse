import api from './api';

export const getLibrary = async () => {
  const { data } = await api.get('/users/library');
  return data.data;
};

export const getFavorites = async () => {
  const { data } = await api.get('/users/favorites');
  return data.data;
};

export const addFavorite = async (bookId) => {
  const { data } = await api.post(`/users/favorites/${bookId}`);
  return data.data;
};

export const removeFavorite = async (bookId) => {
  const { data } = await api.delete(`/users/favorites/${bookId}`);
  return data.data;
};

export const getProgress = async (bookId) => {
  const { data } = await api.get(`/users/progress/${bookId}`);
  return data.data;
};

export const updateProgress = async (bookId, currentPage) => {
  const { data } = await api.put(`/users/progress/${bookId}`, { currentPage });
  return data.data;
};
