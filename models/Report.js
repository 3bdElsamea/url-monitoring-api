const mongoose = require("mongoose");
const Email = require("../services/mailService");
const User = require("./User");

const historySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    // Response time for each check request
    responseTime: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: {
      updatedAt: false,
    },
    _id: false,
  }
);
const reportSchema = new mongoose.Schema({
  check: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Check",
    required: [true, "Report must belong to a check"],
  },
  status: {
    type: String,
    enum: ["up", "down"],
    default: "up",
  },
  availability: {
    type: Number,
    required: true,
    default: 0,
  },
  outages: {
    type: Number,
    default: 0,
  },
  downtime: {
    type: Number,
    default: 0,
  },
  uptime: {
    type: Number,
    default: 0,
  },
  // Average response time
  responseTime: {
    type: Number,
    default: 0,
  },
  history: {
    type: [historySchema],
    default: [],
  },
});

reportSchema.pre(/^find/, function (next) {
  this.populate({
    path: "check",
    select: "owner name url path timeout interval threshold",
  });
  next();
});
reportSchema.methods = {
  //  Send email to user when status is changed
  async sendStatusEmail() {
    console.log(this.check.url);
    const user = await User.findById(this.check.owner);
    await new Email(user).sendStatusChangeEmail(this.status, this.check.name);
  },
};

module.exports = mongoose.model("Report", reportSchema);
