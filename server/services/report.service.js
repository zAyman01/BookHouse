import Report from '../models/report.model.js';
import User from '../models/user.model.js';
import Book from '../models/book.model.js';
import Review from '../models/review.model.js';
import AppError from '../utils/appError.util.js';
import paginate from '../helpers/paginate.helper.js';
import { REPORT_STATUS, REPORT_TYPE } from '../config/constants.config.js';

const validateTarget = async (type, targetId) => {
  if (type === REPORT_TYPE.BOOK) {
    const book = await Book.findOne({ _id: targetId, isPublished: true });
    if (!book) throw new AppError('Target book not found', 404);
  } else if (type === REPORT_TYPE.USER) {
    const user = await User.findById(targetId);
    if (!user) throw new AppError('Target user not found', 404);
  } else if (type === REPORT_TYPE.REVIEW) {
    const review = await Review.findById(targetId);
    if (!review) throw new AppError('Target review not found', 404);
  }
};

export const submitReport = async (data, requestingUser) => {
  await validateTarget(data.type, data.targetId);

  if (data.type === REPORT_TYPE.USER) {
    if (data.targetId === requestingUser._id.toString()) {
      throw new AppError('You cannot report yourself', 400);
    }
  }

  const report = await Report.create({
    reportedBy: requestingUser._id,
    type: data.type,
    targetId: data.targetId,
    reason: data.reason,
  });

  return report;
};

export const getAllReports = async (query) => {
  const { skip, limit, currentPage } = paginate(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.type) filter.type = query.type;

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Report.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return { reports, total, totalPages, currentPage, limit };
};

export const getReportById = async (id) => {
  const report = await Report.findById(id)
    .populate('reportedBy', 'name email')
    .lean();

  if (!report) throw new AppError('Report not found', 404);

  return report;
};

export const updateReportStatus = async (id, data) => {
  const report = await Report.findById(id);
  if (!report) throw new AppError('Report not found', 404);

  if (report.status !== REPORT_STATUS.PENDING) {
    throw new AppError('Can only update pending reports', 400);
  }

  report.status = data.status;
  if (data.adminNotes) {
    report.adminNotes = data.adminNotes;
  }
  await report.save();

  return report;
};
