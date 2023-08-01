const express = require("express");

const authMW = require("../middlewares/authMW");
const {
  groupReportsByTags,
  getReportByCheckId,
} = require("../controllers/reportController");

const router = express.Router();

router.use(authMW);

router.route("/tags").post(groupReportsByTags);

router.route("/:checkId").get(getReportByCheckId);

module.exports = router;
