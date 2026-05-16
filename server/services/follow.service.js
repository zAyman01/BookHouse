import Follow from '../models/follow.model.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.util.js';

export const followUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    throw new AppError('You cannot follow yourself', 400);
  }

  const target = await User.findById(followingId);
  if (!target) throw new AppError('User not found', 404);

  const existing = await Follow.findOne({ follower: followerId, following: followingId });
  if (existing) throw new AppError('Already following this user', 409);

  await Follow.create({ follower: followerId, following: followingId });
  return null;
};

export const unfollowUser = async (followerId, followingId) => {
  const result = await Follow.findOneAndDelete({ follower: followerId, following: followingId });
  if (!result) throw new AppError('Not following this user', 404);
  return null;
};

export const getFollowers = async (userId) => {
  const follows = await Follow.find({ following: userId })
    .populate('follower', 'name avatar')
    .lean();
  return follows.map((f) => f.follower);
};

export const getFollowing = async (userId) => {
  const follows = await Follow.find({ follower: userId })
    .populate('following', 'name avatar')
    .lean();
  return follows.map((f) => f.following);
};

export const getFollowCounts = async (userId) => {
  const [followers, following] = await Promise.all([
    Follow.countDocuments({ following: userId }),
    Follow.countDocuments({ follower: userId }),
  ]);
  return { followers, following };
};

export const isFollowing = async (followerId, followingId) => {
  const exists = await Follow.findOne({ follower: followerId, following: followingId });
  return !!exists;
};
