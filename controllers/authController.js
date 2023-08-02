const jwt = require("jsonwebtoken");

const User = require("../models/User");
const AppError = require("../utils/appError");

const catchAsync = require("../utils/catchAsync");
const { success } = require("../utils/response");
const Email = require("../services/mailService");
const createVerificationToken = require("../utils/createVerificationToken");

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const verificationToken = createVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: Date.now() + 10 * 60 * 1000,
  });

  await new Email(user).sendEmailVerification(verificationToken);

  success(res, 201, { message: "Verification email sent" });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Please provide email and password", 400);

  const user = await User.authenticate(email, password);

  if (!user.isVerified) throw new AppError("Please verify your email", 401);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });

  success(res, 200, { token });
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError("Invalid or Expired Token", 400);

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;
  await user.save();

  success(res, 200, { message: "Email verified successfully" });
});

exports.resendEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email, isVerified: false });
  if (!user) throw new AppError("User not found or is already verified", 404);

  user.emailVerificationToken = createVerificationToken();
  user.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await new Email(user).sendEmailVerification(user.emailVerificationToken);

  success(res, 200, { message: "Verification email sent" });
});

exports.myProfile = catchAsync(async (req, res, next) => {
  const user = req.user;
  success(res, 200, { user });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
  });

  success(res, 200, { updatedUser });
});

// These routes are for testing purposes only and should be removed in production
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  success(res, 200, { users });
});
