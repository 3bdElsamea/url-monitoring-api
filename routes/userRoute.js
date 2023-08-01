const express = require("express");

const authMW = require("../middlewares/authMW");

const {
  signup,
  login,
  verifyEmail,
  resendEmailVerification,
  myProfile,
  getAllUsers,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-email-verification", resendEmailVerification);

router.get("/users", getAllUsers); // for testing purposes only and should be removed

router.use(authMW);

router.get("/me", myProfile);

module.exports = router;
