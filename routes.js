const express = require("express");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoute");
const AppError = require("./utils/appError");

const router = express.Router();

// Limit requests
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });
//
// router.use("/api", limiter);

// User routes
router.use("/api/auth", userRouter);

// catch not found routes
router.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} n this server!`, 404));
});

router.use(errorHandler);

module.exports = router;
