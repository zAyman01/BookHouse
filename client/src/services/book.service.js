import api from './api';

export const getBooks = async (params = {}) => {
  const { data } = await api.get('/books', { params });
  return data.data;
};

export const getBook = async (id) => {
  const { data } = await api.get(`/books/${id}`);
  return data.data;
};

export const createBook = async (formData) => {
  const { data } = await api.post('/books', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateBook = async (id, formData) => {
  const { data } = await api.put(`/books/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteBook = async (id) => {
  const { data } = await api.delete(`/books/${id}`);
  return data.data;
};

export const readBook = async (id) => {
  const { data } = await api.get(`/books/${id}/read`);
  return data.data;
};

export const getGenres = async () => {
  const { data } = await api.get('/books/genres');
  return data.data;
};

export const getMyBooks = async () => {
  const { data } = await api.get('/books/my');
  return data.data;
};

export const getBookAnalytics = async () => {
  const { data } = await api.get('/books/analytics');
  return data.data;
};

export const publishBook = async (id) => {
  const { data } = await api.put(`/books/${id}/publish`);
  return data.data;
};
