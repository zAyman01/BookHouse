import Joi from 'joi';

export const placeOrderSchema = Joi.object({
  bookIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  couponCode: Joi.string().trim().optional(),
});
