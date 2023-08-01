const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");

const AppError = require("../utils/appError");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please Enter your email"],
      unique: true,
      validate: {
        validator: function (val) {
          return val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        },
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please Enter your password"],
      selected: false,
      minlength: [8, "Password must be at least 8 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
// After save user send email verification token

// User Static Method to authenticate user by email and password
userSchema.statics = {
  authenticate: async function (email, password) {
    const user = await this.findOne({ email }).select("+password");
    if (!user) throw new AppError("Incorrect email or password", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new AppError("Incorrect email or password", 401);

    return user;
  },
};

// User Instance Methods
userSchema.methods = {
  // Generate Email Verification Token
  createEmailVerificationToken: function () {
    //   Create random alphanumeric token
    const verificationToken = randomString.generate({
      length: 10,
      charset: "alphanumeric",
    });

    this.emailVerificationToken = verificationToken;
    this.emailVerificationTokenExpires = Date.now() + 10 * 60 * 1000;

    this.save();

    console.log(this);

    return verificationToken;
  },
};
module.exports = mongoose.model("User", userSchema);
