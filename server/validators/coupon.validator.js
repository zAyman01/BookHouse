import Joi from 'joi';

export const createCouponSchema = Joi.object({
  code: Joi.string().uppercase().trim().required(),
  discountPercent: Joi.number().min(1).max(100).required(),
  expiresAt: Joi.date().iso().greater('now').required(),
  usageLimit: Joi.number().min(1).default(1),
  isActive: Joi.boolean().optional(),
});

export const validateCouponSchema = Joi.object({
  code: Joi.string().uppercase().trim().required(),
});
