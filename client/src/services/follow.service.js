import api from './api';

export const followUser = async (userId) => {
  const { data } = await api.post(`/follow/${userId}`);
  return data.data;
};

export const unfollowUser = async (userId) => {
  const { data } = await api.delete(`/follow/${userId}`);
  return data.data;
};

export const getFollowers = async (userId) => {
  const { data } = await api.get(`/follow/${userId}/followers`);
  return data.data;
};

export const getFollowing = async (userId) => {
  const { data } = await api.get(`/follow/${userId}/following`);
  return data.data;
};

export const getFollowStats = async (userId) => {
  const { data } = await api.get(`/follow/${userId}/stats`);
  return data.data;
};

export const checkFollow = async (userId) => {
  const { data } = await api.get(`/follow/${userId}/check`);
  return data.data;
};
