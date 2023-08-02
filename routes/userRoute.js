const express = require("express");

const authMW = require("../middlewares/authMW");

const {
  signup,
  login,
  verifyEmail,
  resendEmailVerification,
  myProfile,
  updateProfile,
} = require("../controllers/authController");
const {
  validateSignUp,
  validateLogin,
  validateResendVerificationEmail,
  validateUpdateProfile,
} = require("../validation/userValidation");

const router = express.Router();

router.post("/signup", validateSignUp, signup);
router.post("/login", validateLogin, login);
router.get("/verify-email/:token", verifyEmail);
router.post(
  "/resend-email-verification",
  validateResendVerificationEmail,
  resendEmailVerification
);

router.use(authMW);

router.route("/me").get(myProfile).patch(validateUpdateProfile, updateProfile);

module.exports = router;
