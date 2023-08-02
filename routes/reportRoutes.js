const express = require("express");

const authMW = require("../middlewares/authMW");
const {
  groupReportsByTags,
  getReportByCheckId,
  getAllUserReports,
} = require("../controllers/reportController");

const router = express.Router();

router.use(authMW);

router.route("/").get(getAllUserReports);

router.route("/tags").post(groupReportsByTags);

router.route("/:checkId").get(getReportByCheckId);

module.exports = router;
