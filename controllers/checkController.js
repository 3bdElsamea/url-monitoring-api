const Check = require("../models/Check");
const Report = require("../models/Report");
const catchAsync = require("../utils/catchAsync");
const { success, deleteResponse } = require("../utils/response");
const cronJob = require("../services/cronService");

exports.getAllUserChecks = catchAsync(async (req, res, next) => {
  const checks = await Check.getOwnerChecks(req.user._id);

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
  await check.createReport();
  await cronJob.scheduleTask(check);
  success(res, 201, {
    data: { message: "Check created successfully with its report", check },
  });
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
  const checkToDelete = await Check.checkExistsById(
    req.params.id,
    req.user._id
  );
  await checkToDelete.deleteOne();
  await Report.deleteOne({ check: checkToDelete._id });

  deleteResponse(res, "The Check and its Report have been deleted");
});
