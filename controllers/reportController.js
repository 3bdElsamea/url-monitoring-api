const { Report } = require("../models/Report");
const Check = require("../models/Check");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");

exports.getAllUserReports = catchAsync(async (req, res, next) => {
  const checks = await Check.getOwnerChecks(req.user._id);
  const checksId = checks.map((check) => check._id);
  const reports = await Report.find({ check: { $in: checksId } }).populate(
    "history"
  );
  if (reports.length === 0)
    return next(
      new AppError("No reports found for the authenticated user", 404)
    );

  success(res, 200, { total: reports.length, reports });
});

exports.getReportByCheckId = catchAsync(async (req, res, next) => {
  const check = await Check.checkExistsById(req.params.checkId, req.user._id);
  const report = await Report.findOne({ check: check._id }).populate("history");
  if (!report) throw new AppError("No report found for that check", 404);

  success(res, 200, { report });
});

exports.groupReportsByTags = catchAsync(async (req, res, next) => {
  const checks = await Check.getChecksByTags(req.body.tags, req.user._id);
  const checksId = checks.map((check) => check._id);

  const reports = await Report.find({
    check: { $in: checksId },
  }).populate("check");
  if (reports.length === 0)
    throw new AppError("No reports for Checks with that tag", 404);

  success(res, 200, { total: reports.length, reports });
});
