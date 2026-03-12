import Joi from 'joi';

export const createBookSchema = Joi.object({
  title:       Joi.string().min(1).max(200).trim().required(),
  description: Joi.string().min(10).trim().required(),
  price:       Joi.number().min(0).required(),
  genre:       Joi.string().trim().optional(),
  category:    Joi.string().trim().optional(),
  // Author can publish immediately or keep as draft
  isPublished: Joi.boolean().optional(),
});

// All fields optional on update — .min(1) means at least one field must be present
export const updateBookSchema = Joi.object({
  title:       Joi.string().min(1).max(200).trim(),
  description: Joi.string().min(10).trim(),
  price:       Joi.number().min(0),
  genre:       Joi.string().trim(),
  category:    Joi.string().trim(),
  isPublished: Joi.boolean(),
}).min(1);
