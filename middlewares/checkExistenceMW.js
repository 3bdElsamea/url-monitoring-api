const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports = (Model) => {
  return catchAsync(async (req, res, next) => {
    const modelName =
      Model.modelName[0].toUpperCase() + Model.modelName.slice(1).toLowerCase();
    const doc = await Model.findById(req.params.id);
    if (!doc) {
      return next(new AppError(`${modelName} not found`, 404));
    }
    req.foundData = doc;
    next();
  });
};
