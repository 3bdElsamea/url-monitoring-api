const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");

const AppError = require("../utils/appError");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter your name"],
      minlength: [3, "Name must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Please Enter your email"],
      unique: true,
      validate: {
        validator: function (val) {
          return val.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
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

// pre for find by id and update to hash password
userSchema.pre("findOneAndUpdate", async function (next) {
  if (!this._update.password) return next();
  this._update.password = await bcrypt.hash(this._update.password, 12);
  next();
});

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
