const express = require("express");

const authMW = require("../middlewares/authMW");
const {
  getAllUserChecks,
  createUserCheck,
  getUserCheck,
  updateUserCheck,
  deleteUserCheck,
} = require("../controllers/checkController");

const router = express.Router();

router.use(authMW);
router.route("/").get(getAllUserChecks).post(createUserCheck);
router
  .route("/:id")
  .get(getUserCheck)
  .patch(updateUserCheck)
  .delete(deleteUserCheck);

module.exports = router;
