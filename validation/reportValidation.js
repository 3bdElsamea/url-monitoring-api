const joi = require("joi");
const ValidationMW = require("../middlewares/validationMW");

const groupReportsByTags = joi.object({
  tags: joi.array().items(joi.string().trim().required()).required(),
});

module.exports = {
  validateReportByTags: ValidationMW(groupReportsByTags),
};
