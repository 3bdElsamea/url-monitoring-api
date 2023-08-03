const joi = require("joi");
const ValidationMW = require("../middlewares/validationMW");

const authenticationSchema = joi.object({
  username: joi.string().trim().required(),
  password: joi.string().required(),
});

const httpHeadersSchema = joi.object({
  key: joi.string().trim().required(),
  value: joi.string().trim().required(),
});

const assertSchema = joi.object({
  statusCode: joi.number().required(),
});

const createCheckSchema = joi.object({
  name: joi.string().min(3).required(),
  url: joi.string().required(),
  protocol: joi.string().valid("http", "https", "tcp").default("https"),
  path: joi.string().trim().default(""),
  port: joi.number().default(443),
  webhook: joi.string().trim().default(""),
  timeout: joi.number().min(2000).max(30000).default(5000),
  interval: joi.number().min(1).max(59).default(10),
  threshold: joi.number().default(1),
  authentication: authenticationSchema,
  httpHeaders: joi.array().items(httpHeadersSchema),
  assert: assertSchema,
  tags: joi.array().items(joi.string().trim()),
  ignoreSSL: joi.boolean().default(false),
});

const updateCheckSchema = joi.object({
  name: joi.string().min(3),
  // url: joi.string().trim(),
  protocol: joi.string().valid("http", "https", "tcp"),
  path: joi.string().trim(),
  port: joi.number(),
  webhook: joi.string().trim(),
  timeout: joi.number().min(2000).max(30000),
  interval: joi.number().min(1).max(59),
  threshold: joi.number(),
  authentication: authenticationSchema,
  httpHeaders: joi.array().items(httpHeadersSchema),
  assert: assertSchema,
  tags: joi.array().items(joi.string().trim()),
  ignoreSSL: joi.boolean(),
});

module.exports = {
  createCheckValidation: ValidationMW(createCheckSchema),
  updateCheckValidation: ValidationMW(updateCheckSchema),
};
