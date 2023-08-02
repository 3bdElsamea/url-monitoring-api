const joi = require("joi");
const ValidationMW = require("../middlewares/validationMW");

const signUpSchema = joi.object({
  name: joi.string().min(3).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
});

const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

const validateResendVerificationEmail = joi.object({
  email: joi.string().email().required(),
});

const validateUpdateProfile = joi.object({
  name: joi.string().min(3),
  password: joi.string().min(8),
});

module.exports = {
  validateSignUp: ValidationMW(signUpSchema),
  validateLogin: ValidationMW(loginSchema),
  validateResendVerificationEmail: ValidationMW(
    validateResendVerificationEmail
  ),
  validateUpdateProfile: ValidationMW(validateUpdateProfile),
};
