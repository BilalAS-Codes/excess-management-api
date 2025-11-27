// modules/auth/auth.validation.js
import Joi from "joi";

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),

  company_name: Joi.string().required(),
  company_name_ar: Joi.string().allow(""),
  company_address: Joi.string().allow(""),

  region: Joi.string().allow(""),
  industry: Joi.string().required(),
  phone_number: Joi.string().required(),
  role: Joi.string().required(),

  language_preference: Joi.string().valid("en", "ar").default("en"),
  notification_preferences: Joi.object().default({}),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const verifyLoginOtpSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  otp_code: Joi.string().length(6).required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});