import Joi from 'joi';
import { REPORT_STATUS, REPORT_TYPE } from '../config/constants.config.js';

export const createReportSchema = Joi.object({
  type: Joi.string().valid(...Object.values(REPORT_TYPE)).required(),
  targetId: Joi.string().hex().length(24).required(),
  reason: Joi.string().min(10).max(500).trim().required(),
});

export const updateReportStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(REPORT_STATUS)).required(),
  adminNotes: Joi.string().trim().optional(),
});
