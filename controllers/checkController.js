const Check = require("../models/Check");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { success, deleteResponse } = require("../utils/response");

/*Helper Functions*/
// const checkExists = async (id, owner) => {
//   const checkExists = await Check.findOne({
//     _id: id,
//     owner,
//   });
//   if (!checkExists) throw new AppError("No check found with that ID", 404);
//
//   console.log("From the function", checkExists);
//
//   return checkExists;
// };

/*End Of helper Functions*/

exports.getAllUserChecks = catchAsync(async (req, res, next) => {
  const checks = await Check.find({ owner: req.user._id });

  success(res, 200, {
    total: checks.length,
    checks,
  });
});

exports.getUserCheck = catchAsync(async (req, res, next) => {
  const check = await Check.checkExistsById(req.params.id, req.user._id);
  success(res, 200, { check });
});

exports.createUserCheck = catchAsync(async (req, res) => {
  const check = await Check.create({ ...req.body, owner: req.user._id });
  success(res, 201, { check });
});

exports.updateUserCheck = catchAsync(async (req, res) => {
  const check = await Check.checkExistsById(req.params.id, req.user._id);
  Object.keys(req.body).forEach((key) => {
    check[key] = req.body[key];
  });

  await check.save();

  success(res, 200, { check });
});

exports.deleteUserCheck = catchAsync(async (req, res, next) => {
  const checkToDelete = await checkExists(req.params.id, req.user._id);
  // use deleteOne instead of remove
  await checkToDelete.deleteOne();

  deleteResponse(res, "Check deleted successfully");
});
