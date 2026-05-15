import api from './api';

export const getReviews = async (bookId, params = {}) => {
  const { data } = await api.get(`/reviews/book/${bookId}`, { params });
  return data.data;
};

export const createReview = async (bookId, reviewData) => {
  const { data } = await api.post(`/reviews/book/${bookId}`, reviewData);
  return data.data;
};

export const updateReview = async (id, reviewData) => {
  const { data } = await api.put(`/reviews/${id}`, reviewData);
  return data.data;
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(`/reviews/${id}`);
  return data.data;
};
