import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import * as followService from '../services/follow.service.js';

export const follow = catchAsync(async (req, res) => {
  await followService.followUser(req.user._id, req.params.userId);
  ApiResponse.success(res, null, 'Followed successfully');
});

export const unfollow = catchAsync(async (req, res) => {
  await followService.unfollowUser(req.user._id, req.params.userId);
  ApiResponse.success(res, null, 'Unfollowed successfully');
});

export const getFollowers = catchAsync(async (req, res) => {
  const users = await followService.getFollowers(req.params.userId);
  ApiResponse.success(res, { users }, 'Followers fetched successfully');
});

export const getFollowing = catchAsync(async (req, res) => {
  const users = await followService.getFollowing(req.params.userId);
  ApiResponse.success(res, { users }, 'Following fetched successfully');
});

export const getFollowStats = catchAsync(async (req, res) => {
  const counts = await followService.getFollowCounts(req.params.userId);
  ApiResponse.success(res, counts, 'Follow stats fetched successfully');
});

export const checkFollow = catchAsync(async (req, res) => {
  const following = await followService.isFollowing(req.user._id, req.params.userId);
  ApiResponse.success(res, { following }, 'Follow status checked');
});
