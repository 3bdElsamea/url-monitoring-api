const ValidationErrors = require("../utils/validationError");

module.exports = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const validationErrors = error.details.map((err) => err.message);
      return next(new ValidationErrors(validationErrors));
    }
    next();
  };
};
