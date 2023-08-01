const mongoose = require("mongoose");
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

const checkSchema = new mongoose.Schema({
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
    enum: ["HTTP", "HTTPS", "TCP"],
    default: "HTTPS",
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
  },
  interval: {
    type: Number,
    default: 600000, // 10 minutes default
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
});
// static method to check if the user has a check with the same name and url
checkSchema.statics.checkExists = async function (name, url = null, owner) {
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
};
checkSchema.pre("save", async function (next) {
  await this.constructor.checkExists(this.name, this.url, this.owner);
  next();
});

module.exports = mongoose.model("Check", checkSchema);
