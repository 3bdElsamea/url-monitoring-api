const express = require("express");

const authMW = require("../middlewares/authMW");
const {
  getAllUserChecks,
  createUserCheck,
  getUserCheck,
  updateUserCheck,
  deleteUserCheck,
} = require("../controllers/checkController");
const {
  createCheckValidation,
  updateCheckValidation,
} = require("../validation/checkValidation");

const router = express.Router();

router.use(authMW);
router
  .route("/")
  .get(getAllUserChecks)
  .post(createCheckValidation, createUserCheck);
router
  .route("/:id")
  .get(getUserCheck)
  .patch(updateCheckValidation, updateUserCheck)
  .delete(deleteUserCheck);

module.exports = router;
