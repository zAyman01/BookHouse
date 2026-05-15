import catchAsync from '../utils/catchAsync.util.js';
import * as reportService from '../services/report.service.js';
import ApiResponse from '../utils/apiResponse.util.js';

export const submitReport = catchAsync(async (req, res) => {
  const report = await reportService.submitReport(req.body, req.user);

  ApiResponse.success(res, { report }, 'Report submitted successfully', 201);
});

export const getAllReports = catchAsync(async (req, res) => {
  const result = await reportService.getAllReports(req.query);

  ApiResponse.success(res, result, 'Reports fetched successfully');
});

export const getReportById = catchAsync(async (req, res) => {
  const report = await reportService.getReportById(req.params.id);

  ApiResponse.success(res, { report }, 'Report fetched successfully');
});

export const updateReportStatus = catchAsync(async (req, res) => {
  const report = await reportService.updateReportStatus(req.params.id, req.body);

  ApiResponse.success(res, { report }, 'Report status updated successfully');
});
