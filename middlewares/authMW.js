const jwt = require("jsonwebtoken");

const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
};

const checkUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("The user belonging to this token does not exist", 401);
  }
  if (!user.isVerified) {
    throw new AppError("Please verify your email", 401);
  }
  return user;
};

module.exports = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized - No Bearer Token Provided", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  req.user = await checkUser(decoded.id);

  next();
});
