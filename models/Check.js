const mongoose = require("mongoose");
const { Report } = require("./Report");
const AppError = require("../utils/AppError");

const authenticationSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const httpHeadersSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const assertSchema = new mongoose.Schema(
  {
    statusCode: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const checkSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Check must belong to a user"],
    },
    name: {
      type: String,
      required: [true, "Please Enter your name"],
      minlength: [3, "Name must be at least 3 characters"],
    },
    url: {
      type: String,
      required: [true, "You must provide a url"],
    },
    protocol: {
      type: String,
      enum: ["http", "https", "tcp"],
      default: "https",
    },
    path: {
      type: String,
      default: "",
    },
    port: {
      type: Number,
      default: 443,
    },
    webhook: {
      type: String,
      default: "",
    },
    timeout: {
      type: Number,
      default: 5000, // 5 seconds default
      min: [2000, "Timeout must be at least 2 seconds"],
      max: [30000, "Timeout must be at most 30 seconds"],
    },
    interval: {
      type: Number,
      default: 10, // 10 minutes default
      min: [3, "Interval must be at least 3 minute"],
      max: [59, "Interval must be at most 59 minutes"],
    },
    threshold: {
      type: Number,
      default: 1,
    },
    authentication: {
      type: authenticationSchema,
      required: false,
    },
    httpHeaders: {
      type: [httpHeadersSchema],
      required: false,
    },
    assert: {
      type: assertSchema,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    ignoreSSL: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// static methods
checkSchema.statics = {
  checkExists: async function (name, url = null, owner) {
    const checkExists = await this.findOne({
      name,
      url,
      owner,
    });
    if (checkExists)
      throw new AppError(
        "Check with the name and url already exists in your checks",
        400
      );

    return true;
  },
  //   get owner checks
  getOwnerChecks: async function (owner) {
    const checks = await this.find({ owner });
    if (checks.length === 0)
      throw new AppError("No checks found for the authenticated user", 404);
    return checks;
  },
  //   Check By Id and  Owner
  checkExistsById: async function (id, owner) {
    const check = await this.findOne({ _id: id, owner });
    if (!check) throw new AppError("Check not found", 404);
    return check;
  },
  //     Get Check by tags
  getChecksByTags: async function (tags, owner) {
    const checks = await this.find({
      tags: { $in: tags },
      owner,
    });
    if (checks.length === 0)
      throw new AppError("No checks found with the given tags", 404);
    return checks;
  },
};

// Instance methods
checkSchema.methods = {
  //     create report
  createReport: async function () {
    await Report.create({ check: this._id });
  },
};
checkSchema.pre("save", async function (next) {
  await this.constructor.checkExists(this.name, this.url, this.owner);
  next();
});

module.exports = mongoose.model("Check", checkSchema);
