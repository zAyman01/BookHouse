import Joi from 'joi';
import { ROLES } from '../config/constants.config.js';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).required(),
  // Admins are never self-registered — only user or author allowed here
  role: Joi.string()
    .valid(ROLES.USER, ROLES.AUTHOR)
    .default(ROLES.USER),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});
